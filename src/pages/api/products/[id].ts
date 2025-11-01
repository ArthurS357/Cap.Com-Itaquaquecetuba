import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  if (!id || typeof id !== 'string' || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: 'Invalid product ID provided.' });
  }

  const productId = parseInt(id, 10);

  try {
    // Buscar o produto principal
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true, category: true },
    });

    if (!product) {
      await prisma.$disconnect();
      return res.status(404).json({ error: 'Product not found' });
    }

    // Buscar produtos similares
    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId },
        ],
        NOT: {
          id: productId, // Excluir o produto atual
        },
      },
      take: 4, // Limitar a 4 similares
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        brand: { 
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: {
          name: 'asc'
      }
    });

    await prisma.$disconnect();
    res.status(200).json({ product, similarProducts });

  } catch (error) {
    console.error(`[API Error] Failed to fetch product data for ID ${id}:`, error);
    await prisma.$disconnect().catch(disconnectError => {
        console.error("Error disconnecting Prisma after API error:", disconnectError);
    });
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
}