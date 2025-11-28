import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de Validação para Criação
const categoryCreateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  imageUrl: z.string().url().optional().or(z.literal('')),
  parentId: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().int().positive().optional().nullable()
  ),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // GET: Listar todas as categorias (Público)
  if (method === 'GET') {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { parent: true }
      });
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      return res.status(500).json({ error: "Erro ao buscar categorias" });
    }
  }

  // POST: Criar nova categoria (Protegido)
  else if (method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Não autorizado" });

    try {
      // 1. Validação Zod
      const parseResult = categoryCreateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: parseResult.error.format()
        });
      }

      const { name, imageUrl, parentId } = parseResult.data;

      const newCategory = await prisma.category.create({
        data: {
          name,
          slug: slugify(name),
          imageUrl: imageUrl || null,
          parentId: parentId || null,
        },
      });

      // Revalida a Home, pois ela lista categorias
      try {
        await res.revalidate('/');
      } catch (err) {
        console.error('Erro de revalidação:', err);
      }

      return res.status(201).json(newCategory);
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      // Tratamento de erro de unicidade (Slug ou Nome já existem)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return res.status(409).json({ error: "Já existe uma categoria com este nome." });
        }
      }
      return res.status(500).json({ error: "Erro ao criar categoria" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
