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
      include: { brand: true, category: true }, // Inclui brand e category para os similares também
    });

    res.status(200).json({ product, similarProducts });
  } catch (error) {
    // Passo 2: Adicionar log detalhado do erro no servidor
    console.error(`[API Error] Failed to fetch product data for ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch product data' });
  } finally {
      // Garante que a conexão Prisma seja fechada mesmo se ocorrer um erro
      await prisma.$disconnect();
  }
}
