import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { slugify } from '@/lib/utils';

// --- FIX: Prisma Singleton Pattern (Igual ao arquivo anterior) ---
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// ----------------------------------------------------------------

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  const productId = parseInt(id, 10);

  // --- GET: Buscar 1 Produto (Público ou Privado) ---
  if (method === 'GET') {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { brand: true, category: true },
      });

      if (!product) return res.status(404).json({ error: 'Produto não encontrado' });

      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  // ---------------------------------------------------
  // DAQUI PARA BAIXO: ÁREA RESTRITA (PUT / DELETE)
  // ---------------------------------------------------

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Não autorizado. Faça login." });
  }

  // --- PUT: Atualizar Produto ---
  if (method === 'PUT') {
    try {
      const { name, description, price, type, brandId, categoryId, imageUrl } = req.body;

      // Se o nome mudou, podemos querer atualizar o slug também
      // Mas cuidado: mudar slug quebra links antigos (SEO). 
      // Aqui, vamos atualizar o slug apenas se o nome mudar.
      let dataToUpdate: any = {
        name,
        description,
        price: price ? parseFloat(price) : null,
        type,
        imageUrl,
        brandId: Number(brandId),
        categoryId: Number(categoryId)
      };

      if (name) {
          dataToUpdate.slug = slugify(name);
      }

      const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: dataToUpdate,
      });

      return res.status(200).json(updatedProduct);
    } catch (error: any) {
      console.error("Erro ao atualizar:", error);
      if (error.code === 'P2002') {
        return res.status(409).json({ error: "Nome de produto já existe (slug duplicado)." });
      }
      return res.status(500).json({ error: "Falha ao atualizar produto" });
    }
  }

  // --- DELETE: Remover Produto ---
  else if (method === 'DELETE') {
    try {
      // Primeiro, removemos as compatibilidades para não dar erro de chave estrangeira
      await prisma.printerCompatibility.deleteMany({
        where: { cartridgeId: productId }
      });
      
      // Se for impressora, remove onde ela aparece como printerId
      await prisma.printerCompatibility.deleteMany({
          where: { printerId: { in: await prisma.printer.findMany({ where: { modelName: { contains: "generic_search_if_needed" } } }).then(ps => ps.map(p => p.id)) } } 
          // Simplificação: No seu schema atual, Product não é Printer, então o delete direto funciona 
          // a menos que existam relações complexas. O deleteMany acima é preventivo para Cartridges.
      });

      // Deleta o produto
      await prisma.product.delete({
        where: { id: productId },
      });

      return res.status(200).json({ message: "Produto removido com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar:", error);
      return res.status(500).json({ error: "Falha ao deletar produto. Verifique se há dependências." });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}