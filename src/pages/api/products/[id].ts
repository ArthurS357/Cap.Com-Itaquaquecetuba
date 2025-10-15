import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    const productId = parseInt(id as string, 10);

    // Buscar o produto principal
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true, category: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Buscar produtos similares (mesma categoria, marca diferente ou vice-versa, excluindo o atual)
    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: product.categoryId }, // Mesma categoria
          { brandId: product.brandId },       // Mesma marca
        ],
        NOT: {
          id: productId, // Excluir o produto atual
        },
      },
      take: 4, // Limitar a 4 similares
      include: { brand: true, category: true },
    });

    res.status(200).json({ product, similarProducts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
}