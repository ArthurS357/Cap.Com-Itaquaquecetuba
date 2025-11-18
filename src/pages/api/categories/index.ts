import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // --- GET: Listar Categorias (Público) ---
  if (method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: {
          parent: true,        // Traz os dados da categoria pai
          subCategories: true, // Traz as subcategorias
          _count: {
            select: { products: true } // Conta quantos produtos tem
          }
        },
        orderBy: { name: 'asc' }
      });
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  // --- POST: Criar Categoria (Protegido) ---
  else if (method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Não autorizado" });

    try {
      const { name, imageUrl, parentId } = req.body;

      if (!name) return res.status(400).json({ error: "Nome é obrigatório" });

      const slug = slugify(name);

      const newCategory = await prisma.category.create({
        data: {
          name,
          slug,
          imageUrl,
          parentId: parentId ? Number(parentId) : null,
        },
      });

      return res.status(201).json(newCategory);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(409).json({ error: "Já existe uma categoria com este nome." });
      }
      return res.status(500).json({ error: "Falha ao criar categoria" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
