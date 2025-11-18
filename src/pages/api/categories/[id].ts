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
  const { id } = req.query;
  const categoryId = Number(id);

  if (method === 'GET') {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    return res.status(200).json(category);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autorizado" });

  if (method === 'PUT') {
    try {
      const { name, imageUrl, parentId } = req.body;
      const data: any = { name, imageUrl, parentId: parentId ? Number(parentId) : null };
      if (name) data.slug = slugify(name);

      const updated = await prisma.category.update({
        where: { id: categoryId },
        data,
      });
      return res.status(200).json(updated);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar" });
    }
  }

  else if (method === 'DELETE') {
    try {
      // Verifica se tem produtos antes de deletar
      const count = await prisma.product.count({ where: { categoryId } });
      if (count > 0) return res.status(400).json({ error: `Esta categoria tem ${count} produtos.` });

      await prisma.category.delete({ where: { id: categoryId } });
      return res.status(200).json({ message: "Sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
