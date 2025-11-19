import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';

// Singleton do Prisma
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. FIX: Headers para permitir DELETE e PUT
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

  // --- GET: Buscar 1 Produto ---
  if (method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { brand: true, category: true },
      });

      if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  // DAQUI PARA BAIXO: ÁREA PROTEGIDA
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado. Faça login." });
  }

  // --- PUT: Atualizar Produto ---
  if (method === 'PUT') {
    try {
      const { name, description, price, type, brandId, categoryId, imageUrl } = req.body;

      let dataToUpdate: any = {
        name,
        description,
        price: price ? parseFloat(price) : null,
        type,
        imageUrl,
        brandId: Number(brandId),
        categoryId: Number(categoryId)
      };

      if (name) {
          dataToUpdate.slug = slugify(name);
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: dataToUpdate,
      });

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

  // --- DELETE: Remover Produto ---
  else if (method === 'DELETE') {
    try {
      // 1. Remove compatibilidades primeiro
      await prisma.printerCompatibility.deleteMany({
        where: { cartridgeId: productId }
      });
      
      // 2. Deleta o produto
      await prisma.product.delete({
        where: { id: productId },
      });

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
