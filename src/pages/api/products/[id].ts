import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { z } from 'zod'; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Schema de Validação para Edição
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

  // --- GET ---
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
      // 1. Validação Zod
      const parseResult = productUpdateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: parseResult.error.format() 
        });
      }

      const { name, description, price, type, brandId, categoryId, imageUrl } = parseResult.data;

      const dataToUpdate: Prisma.ProductUpdateInput = {
        ...(name && { name, slug: slugify(name) }),
        ...(description !== undefined && { description }),
        // Lógica: se price vier undefined (não enviado), ignora. Se vier null, atualiza pra null. Se vier número, atualiza.
        ...(price !== undefined && { price }),
        ...(type && { type }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(brandId && { brand: { connect: { id: brandId } } }),
        ...(categoryId && { category: { connect: { id: categoryId } } }),
      };

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: dataToUpdate,
      });

      try {
        const revalidations = [res.revalidate('/')];
        if (updatedProduct.slug) {
          revalidations.push(res.revalidate(`/produto/${updatedProduct.slug}`));
        }
        await Promise.all(revalidations);
      } catch (err) { 
        console.error('Erro ao revalidar', err);
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

  // --- DELETE: Remover ---
  else if (method === 'DELETE') {
    try {
      await prisma.printerCompatibility.deleteMany({
        where: { cartridgeId: productId }
      });

      await prisma.product.delete({
        where: { id: productId },
      });

      try {
        await Promise.all([
          res.revalidate('/'),
          res.revalidate('/busca')
        ]);
      } catch (err) { }

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