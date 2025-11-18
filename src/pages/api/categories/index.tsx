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

  // GET: Listar todas as categorias (Público ou Admin)
  if (method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { parent: true } // Inclui categoria pai se quiser mostrar
      });
      return res.status(200).json(categories);
    } catch (_error) { // <-- CORRIGIDO: Variável não utilizada
      return res.status(500).json({ error: "Erro ao buscar categorias" });
    }
  }

  // POST: Criar nova categoria (Protegido)
  else if (method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Não autorizado" });

    try {
      const { name, imageUrl, parentId } = req.body as { name: string; imageUrl: string | null; parentId: string | null };
      
      const data: { // <-- CORRIGIDO: Usando tipo de objeto explícito
        name: string; 
        slug: string; 
        imageUrl: string | null; 
        parentId?: number | null; 
      } = {
        name,
        slug: slugify(name),
        imageUrl,
      };

      if (parentId) {
        data.parentId = Number(parentId);
      }

      const newCategory = await prisma.category.create({
        data,
      });

      return res.status(201).json(newCategory);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar categoria" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}