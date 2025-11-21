import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { prisma } from '@/lib/prisma'; // Usando o singleton
import { z } from 'zod';

// Schema de Validação para Edição
const categoryUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  parentId: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().int().positive().optional().nullable()
  ),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;
  const categoryId = Number(id);

  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  // GET: Detalhes da categoria
  if (method === 'GET') {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    return res.status(200).json(category);
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Não autorizado" });

  // PUT: Atualizar
  if (method === 'PUT') {
    try {
      const parseResult = categoryUpdateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: parseResult.error.format() 
        });
      }

      const { name, imageUrl, parentId } = parseResult.data;

      const data: Prisma.CategoryUpdateInput = {
        ...(name && { name, slug: slugify(name) }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
        ...(parentId !== undefined && { parent: parentId ? { connect: { id: parentId } } : { disconnect: true } })
      };

      const updated = await prisma.category.update({
        where: { id: categoryId },
        data,
      });

      // Revalidação inteligente
      try {
        const revalidations = [res.revalidate('/')];
        if (updated.slug) {
          revalidations.push(res.revalidate(`/categoria/${updated.slug}`));
        }
        await Promise.all(revalidations);
      } catch (err) {
        console.error('Erro de revalidação:', err);
      }

      return res.status(200).json(updated);
    } catch (error) {
      console.error(error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(409).json({ error: "Nome de categoria já existe." });
        }
      }
      return res.status(500).json({ error: "Erro ao atualizar" });
    }
  }

  // DELETE: Remover
  else if (method === 'DELETE') {
    try {
      // Verifica se tem produtos
      const countProducts = await prisma.product.count({ where: { categoryId } });
      if (countProducts > 0) return res.status(400).json({ error: `Esta categoria tem ${countProducts} produtos. Remova-os primeiro.` });

      // Verifica se tem subcategorias
      const countSubs = await prisma.category.count({ where: { parentId: categoryId } });
      if (countSubs > 0) return res.status(400).json({ error: `Esta categoria tem ${countSubs} subcategorias. Remova-as primeiro.` });

      await prisma.category.delete({ where: { id: categoryId } });
      
      await res.revalidate('/').catch(() => {}); // Tenta revalidar home, ignora erro

      return res.status(200).json({ message: "Sucesso" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao deletar" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}