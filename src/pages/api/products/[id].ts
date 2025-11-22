import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { z } from 'zod';
import { prisma } from '@/lib/prisma'; // Singleton

// Schema de Validação para Edição (Inclui o novo campo)
const productUpdateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").optional(),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().nonnegative().optional().nullable()
  ),
  type: z.string().min(1).optional(),
  brandId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  compatiblePrinterIds: z.array(z.coerce.number().int().positive()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { method } = req;
  const { id } = req.query;

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  const productId = parseInt(id, 10);

  // --- GET --- (Mantido)
  if (method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { brand: true, category: true },
      });

      if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

      return res.status(200).json(product);
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      return res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado. Faça login." });
  }

  // --- PUT: Atualizar ---
  if (method === 'PUT') {
    try {
      const parseResult = productUpdateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: parseResult.error.format()
        });
      }

      const { name, description, price, type, brandId, categoryId, imageUrl, compatiblePrinterIds } = parseResult.data;

      const productPrice = price ?? null;
      const numericBrandId = brandId;
      const numericCategoryId = categoryId;

      // Transação para garantir atomicidade na atualização
      const updatedProduct = await prisma.$transaction(async (tx) => {
        // 1. ATUALIZA O PRODUTO
        const product = await tx.product.update({
          where: { id: productId },
          data: {
            ...(name && { name, slug: slugify(name) }),
            ...(description !== undefined && { description }),
            price: productPrice,
            ...(type && { type }),
            imageUrl: imageUrl || null,
            ...(numericBrandId && { brandId: numericBrandId }),
            ...(numericCategoryId && { categoryId: numericCategoryId }),
          },
        });

        // 2. ATUALIZA COMPATIBILIDADE SOMENTE SE O CAMPO FOI ENVIADO (O select é multi-select, então sempre será enviado)
        if (compatiblePrinterIds !== undefined) {
          // DELETA RELAÇÕES EXISTENTES (Limpeza)
          await tx.printerCompatibility.deleteMany({
            where: { cartridgeId: productId },
          });

          // CRIA NOVAS RELAÇÕES
          if (compatiblePrinterIds && compatiblePrinterIds.length > 0) {
            const compatibilityData = compatiblePrinterIds.map((printerId: number) => ({
              cartridgeId: productId,
              printerId: printerId,
            }));
            await tx.printerCompatibility.createMany({ data: compatibilityData });
          }
        }

        return product;
      });

      // Revalidação em paralelo
      try {
        const revalidations = [res.revalidate('/')];
        if (updatedProduct.slug) {
          revalidations.push(res.revalidate(`/produto/${updatedProduct.slug}`));
        }
        await Promise.all(revalidations);
      } catch (err) {
        console.error('Erro ao revalidar:', err);
      }

      return res.status(200).json(updatedProduct);

    } catch (error) {
      console.error("Erro ao atualizar:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(409).json({ error: "Nome de produto já existe." });
        }
      }
      return res.status(500).json({ error: "Falha ao atualizar produto" });
    }
  }

  // --- DELETE: Remover --- (Mantido)
  else if (method === 'DELETE') {
    try {
      await prisma.printerCompatibility.deleteMany({ where: { cartridgeId: productId } });

      await prisma.product.delete({ where: { id: productId } });

      try {
        await Promise.all([res.revalidate('/'), res.revalidate('/busca')]);
      } catch { }

      return res.status(200).json({ message: "Produto removido com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar:", error);
      return res.status(500).json({ error: "Falha ao deletar. Verifique dependências." });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}