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

  if (method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        include: {
          parent: true,
          _count: { select: { products: true } }
        },
        orderBy: { name: 'asc' }
      });
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }

  else if (method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Não autorizado" });

    try {
      const { name, imageUrl, parentId } = req.body;
      if (!name) return res.status(400).json({ error: "Nome é obrigatório" });

      const newCategory = await prisma.category.create({
        data: {
          name,
          slug: slugify(name),
          imageUrl,
          parentId: parentId ? Number(parentId) : null,
        },
      });
      return res.status(201).json(newCategory);
    } catch (error: any) {
      return res.status(500).json({ error: "Erro ao criar categoria." });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
