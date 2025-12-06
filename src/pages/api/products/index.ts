import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { slugify } from '@/lib/utils';
import { prisma } from '@/lib/prisma';
import { productCreateSchema } from '@/lib/schemas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { method } = req;

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // --- GET: Listar produtos (COM PAGINAÇÃO) ---
  if (method === 'GET') {
    try {
      // 1. Captura page e limit da query string (padrão: página 1, 20 itens)
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // 2. Busca o total para saber quantas páginas existem
      const totalCount = await prisma.product.count();

      // 3. Busca apenas os produtos da página atual
      const products = await prisma.product.findMany({
        skip: skip,
        take: limit,
        include: {
          brand: true,
          category: true,
        },
        orderBy: { id: 'desc' }
      });

      // 4. Retorna os dados + metadados de paginação
      return res.status(200).json({
        data: products,
        meta: {
          total: totalCount,
          page,
          last_page: Math.ceil(totalCount / limit),
          limit
        }
      });
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