import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Validação básica do ID
  if (!id || typeof id !== 'string' || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: 'Invalid product ID provided.' });
  }

  const productId = parseInt(id, 10);

  try {
    // Buscar o produto principal (pode selecionar menos campos se não precisar de todos)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { brand: true, category: true }, // Mantém include aqui se precisar da categoria/marca principal
    });

    if (!product) {
      // Desconecta antes de retornar 404
      await prisma.$disconnect();
      return res.status(404).json({ error: 'Product not found' });
    }

    // Buscar produtos similares, usando SELECT para garantir os campos necessários
    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          // Critérios para similaridade (ex: mesma categoria ou marca)
          { categoryId: product.categoryId },
          { brandId: product.brandId },
        ],
        NOT: {
          id: productId, // Excluir o produto atual
        },
      },
      take: 4, // Limitar a 4 similares
      // ***** CORREÇÃO AQUI: Usar SELECT em vez de INCLUDE *****
      select: {
        id: true,
        name: true,
        slug: true, // <- Garantir que o slug está selecionado
        imageUrl: true,
        // Adicionar price e type se forem usados no ProductCard eventualmente
        // price: true,
        // type: true,
        brand: { // Seleciona apenas id e name da marca, como esperado pelo ProductCard
          select: {
            id: true,
            name: true,
          }
        },
        // Não precisamos selecionar category, categoryId, brandId, createdAt, etc.
        // a menos que o ProductCard precise deles (atualmente não precisa)
      },
      orderBy: { // Opcional: ordenar similares por nome
          name: 'asc'
      }
    });

    // Desconecta o Prisma antes de enviar a resposta
    await prisma.$disconnect();
    res.status(200).json({ product, similarProducts }); // Retorna produto principal e similares

  } catch (error) {
    console.error(`[API Error] Failed to fetch product data for ID ${id}:`, error);
    // Tenta desconectar mesmo em caso de erro
    await prisma.$disconnect().catch(disconnectError => {
        console.error("Error disconnecting Prisma after API error:", disconnectError);
    });
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
}
