import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/pages/api/auth/[...nextauth]'; 
import { slugify } from '@/lib/utils';

// Evita criar múltiplas instâncias do Prisma no desenvolvimento (erro "Too many connections")
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// -------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // --- GET: Listar Produtos ---
  if (method === 'GET') {
    try {
      const products = await prisma.product.findMany({
        include: {
          brand: true,
          category: true,
        },
        orderBy: { id: 'desc' } // Mostra os mais recentes primeiro
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
      // 1. Proteção: Verificar se é admin
      const session = await getServerSession(req, res, authOptions);
      
      if (!session) {
        return res.status(401).json({ error: "Não autorizado. Faça login." });
      }

      const { name, description, price, type, brandId, categoryId, imageUrl } = req.body;

      // 2. Validação básica
      if (!name || !brandId || !categoryId || !type) {
        return res.status(400).json({ error: "Campos obrigatórios (Nome, Marca, Categoria, Tipo) faltando." });
      }

      // 3. Gerar slug automático
      const slug = slugify(name);

      // 4. Criar no Banco de Dados
      const newProduct = await prisma.product.create({
        data: {
          name,
          slug,
          description,
          price: price ? parseFloat(price) : null, // Garante que o preço seja número ou null
          type,
          imageUrl,
          brand: { connect: { id: Number(brandId) } },      // Converte string do form para número
          category: { connect: { id: Number(categoryId) } }, // Converte string do form para número
        },
      });

      return res.status(201).json(newProduct);

    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      
      // Tratamento específico para erro de duplicidade do Prisma (P2002)
      if (error.code === 'P2002') {
        return res.status(409).json({ error: "Já existe um produto com este nome (slug duplicado)." });
      }

      return res.status(500).json({ error: "Falha interna ao criar produto." });
    }
  }

  // --- Método Não Permitido ---
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}