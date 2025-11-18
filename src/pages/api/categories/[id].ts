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

  if (!id || isNaN(categoryId)) return res.status(400).json({ error: 'ID inválido.' });

  // --- GET: Buscar 1 Categoria ---
  if (method === 'GET') {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { parent: true },
    });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    return res.status(200).json(category);
  }

  // Proteção para PUT e DELETE
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autorizado" });

  // --- PUT: Atualizar ---
  if (method === 'PUT') {
    try {
      const { name, imageUrl, parentId } = req.body;
      
      // Evitar que uma categoria seja pai dela mesma
      if (parentId && Number(parentId) === categoryId) {
        return res.status(400).json({ error: "Uma categoria não pode ser pai dela mesma." });
      }

      const dataToUpdate: any = {
        name,
        imageUrl,
        parentId: parentId ? Number(parentId) : null,
      };

      if (name) dataToUpdate.slug = slugify(name);

      const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: dataToUpdate,
      });

      return res.status(200).json(updatedCategory);
    } catch (error: any) {
      if (error.code === 'P2002') return res.status(409).json({ error: "Nome duplicado." });
      return res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
  }

  // --- DELETE: Apagar ---
  else if (method === 'DELETE') {
    try {
      // Verificar se tem produtos
      const productCount = await prisma.product.count({ where: { categoryId } });
      if (productCount > 0) {
        return res.status(400).json({ error: `Não é possível excluir: Esta categoria possui ${productCount} produtos vinculados.` });
      }

      await prisma.category.delete({ where: { id: categoryId } });
      return res.status(200).json({ message: "Categoria removida com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar categoria" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
