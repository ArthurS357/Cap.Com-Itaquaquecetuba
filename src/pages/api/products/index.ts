import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { z } from 'zod'; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Schema de Validação com Zod
const productCreateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  // Aceita string ou número, converte para número. Se for vazio, vira null.
  price: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().nonnegative("O preço não pode ser negativo.").optional().nullable()
  ),
  type: z.string().min(1, "O tipo é obrigatório."),
  brandId: z.coerce.number().int().positive("Marca inválida."),
  categoryId: z.coerce.number().int().positive("Categoria inválida."),
  // Valida URL apenas se não for string vazia
  imageUrl: z.string().url("URL da imagem inválida").optional().or(z.literal('')),
});

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

      // 1. Validação Zod
      const parseResult = productCreateSchema.safeParse(req.body);

      if (!parseResult.success) {
        // Retorna erro 400 com os detalhes do que falhou
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: parseResult.error.format() 
        });
      }

      // Dados validados e tipados
      const { name, description, price, type, brandId, categoryId, imageUrl } = parseResult.data;

      const newProduct = await prisma.product.create({
        data: {
          name,
          slug: slugify(name),
          description,
          price: price ?? null, // Garante null se for undefined
          type,
          imageUrl: imageUrl || null, // Garante null se for string vazia
          brand: { connect: { id: brandId } },
          category: { connect: { id: categoryId } },
        },
        include: {
          category: true
        }
      });

      try {
        // Revalidação em paralelo para melhor performance
        await Promise.all([
          res.revalidate('/'),
          res.revalidate('/busca'),
          newProduct.category?.slug ? res.revalidate(`/categoria/${newProduct.category.slug}`) : null
        ]);
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