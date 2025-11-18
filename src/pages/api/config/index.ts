import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // GET: Ler configurações (Público)
  if (method === 'GET') {
    try {
      // Tenta buscar a config do banner
      const banner = await prisma.storeConfig.findUnique({
        where: { key: 'banner' }
      });
      return res.status(200).json(banner || { value: '', isActive: false });
    } catch (_error) { // <-- CORRIGIDO: Variável não utilizada
      return res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  }

  // POST: Salvar configurações (Privado)
  else if (method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Não autorizado" });

    try {
      const { value, isActive } = req.body;

      // Upsert: Cria se não existir, Atualiza se existir
      const config = await prisma.storeConfig.upsert({
        where: { key: 'banner' },
        update: { value, isActive },
        create: { key: 'banner', value, isActive },
      });

      return res.status(200).json(config);
    } catch (_error) { // <-- CORRIGIDO: Variável não utilizada
      return res.status(500).json({ error: "Erro ao salvar" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}