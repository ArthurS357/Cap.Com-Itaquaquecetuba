import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { prisma } from '@/lib/prisma'; 
import { productUpdateSchema } from '@/lib/schemas'; 

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

  // --- GET: Buscar produto único --- 
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

      const { 
        name, 
        description, 
        price, 
        type, 
        brandId, 
        categoryId, 
        imageUrl, 
        compatiblePrinterIds,
        isFeatured 
      } = parseResult.data;

      const productPrice = price ?? null;
      const numericBrandId = brandId;
      const numericCategoryId = categoryId;

      // Transação para garantir atomicidade
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
            ...(isFeatured !== undefined && { isFeatured }), 
          },
        });

        // 2. ATUALIZA COMPATIBILIDADE
        if (compatiblePrinterIds !== undefined) {
          await tx.printerCompatibility.deleteMany({
            where: { cartridgeId: productId },
          });

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
        const revalidations = [
          res.revalidate('/'),
          res.revalidate('/busca')
        ];
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

  // --- DELETE --- 
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