import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; 
import { slugify } from '@/lib/utils';

// 1. FIX: Prisma Singleton (Evita erro de muitas conexões no dev)
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 2. FIX: Cabeçalhos de CORS (Previne bloqueios do navegador)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { method } = req;

  // Trata requisições de preflight 
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- GET: Listar Produtos (Público) ---
  if (method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        include: {
          brand: true, 
          category: true, 
        },
        orderBy: { id: 'desc' } // Mostra os novos primeiro
      });
      return res.status(200).json(products);
    } catch (error) { 
      console.error("Failed to fetch products:", error); 
      return res.status(500).json({ error: 'Failed to fetch products' });
    }
  } 
  
  // --- POST: Criar Produto (Protegido) ---
  else if (method === 'POST') {
    try {
      // Verifica se está logado
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: "Não autorizado. Faça login." });
      }

      const { name, description, price, type, brandId, categoryId, imageUrl } = req.body;

      // Validação
      if (!name || !brandId || !categoryId || !type) {
        return res.status(400).json({ error: "Campos obrigatórios faltando." });
      }

      // Criação
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
      });

      return res.status(201).json(newProduct);

    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      if (error.code === 'P2002') {
        return res.status(409).json({ error: "Produto com este nome já existe." });
      }
      return res.status(500).json({ error: "Erro interno ao criar produto." });
    }
  } 
  
  // --- Outros Métodos ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
