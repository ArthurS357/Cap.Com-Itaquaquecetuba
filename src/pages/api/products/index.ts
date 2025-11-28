import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Schema de Validação com Zod
const productCreateSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => (val === '' ? null : val),
    z.coerce.number().nonnegative("O preço não pode ser negativo.").optional().nullable()
  ),
  type: z.string().min(1, "O tipo é obrigatório."),
  brandId: z.coerce.number().int().positive("Marca inválida."),
  categoryId: z.coerce.number().int().positive("Categoria inválida."),
  imageUrl: z.string().optional().or(z.literal('')),

  // Array opcional de IDs numéricos para compatibilidade
  compatiblePrinterIds: z.array(z.coerce.number().int().positive()).optional(),

  // Campo booleano opcional para destaque
  isFeatured: z.boolean().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { method } = req;

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- GET: Listar todos os produtos ---
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

  // --- POST: Criar novo produto (Protegido) ---
  else if (method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session) {
        return res.status(401).json({ error: "Não autorizado. Faça login." });
      }

      const parseResult = productCreateSchema.safeParse(req.body);

      if (!parseResult.success) {
        return res.status(400).json({
          error: "Dados inválidos",
          details: parseResult.error.format()
        });
      }

      const {
        name,
        description,
        price,
        type,
        brandId,
        categoryId,
        imageUrl,
        compatiblePrinterIds,
        isFeatured
      } = parseResult.data;

      // Transação para garantir integridade
      const [newProduct] = await prisma.$transaction(async (tx) => {
        // 1. Cria o produto
        const product = await tx.product.create({
          data: {
            name,
            slug: slugify(name),
            description,
            price: price ?? null,
            type,
            imageUrl: imageUrl || null,
            isFeatured: isFeatured || false,
            brand: { connect: { id: brandId } },
            category: { connect: { id: categoryId } },
          },
          // O include garante que o objeto retornado tenha a propriedade 'category'
          include: { category: true }
        });

        // 2. Cria compatibilidades se houver
        if (Array.isArray(compatiblePrinterIds) && compatiblePrinterIds.length > 0) {
          const compatibilityData = compatiblePrinterIds.map((printerId: number) => ({
            cartridgeId: product.id,
            printerId: Number(printerId),
          }));
          await tx.printerCompatibility.createMany({ data: compatibilityData });
        }

        return [product];
      });

      // Revalidação em paralelo (ISR)
      try {
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