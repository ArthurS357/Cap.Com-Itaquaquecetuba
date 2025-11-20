import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { method } = req;

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        include: {
          brand: true, 
          category: true, 
        },
        orderBy: { id: 'desc' }
      });
      return res.status(200).json(products);
    } catch (error) { 
      console.error("Failed to fetch products:", error); 
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  } 
  
  else if (method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: "Não autorizado. Faça login." });
      }

      const { name, description, price, type, brandId, categoryId, imageUrl } = req.body;

      if (!name || !brandId || !categoryId || !type) {
        return res.status(400).json({ error: "Campos obrigatórios faltando." });
      }

      const newProduct = await prisma.product.create({
        data: {
          name,
          slug: slugify(name),
          description,
          price: price ? parseFloat(price) : null,
          type,
          imageUrl,
          brand: { connect: { id: Number(brandId) } },
          category: { connect: { id: Number(categoryId) } },
        },
        include: {
          category: true
        }
      });

      try {
        // 1. Atualiza a Home \ Busca
        await res.revalidate('/');
        await res.revalidate('/busca'); 

        // 3. Atualiza a página da Categoria específica onde o produto foi adicionado
        if (newProduct.category && newProduct.category.slug) {
            console.log(`Revalidando categoria: /categoria/${newProduct.category.slug}`);
            await res.revalidate(`/categoria/${newProduct.category.slug}`);
        }
     
      } catch (err) {
        console.error('Erro ao revalidar páginas:', err);
      }

      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(409).json({ error: "Produto com este nome já existe." });
        }
      }
      return res.status(500).json({ error: "Erro interno ao criar produto." });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
