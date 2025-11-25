import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // GET: Ler configurações (Público)
  if (method === 'GET') {
    try {
      const banner = await prisma.storeConfig.findUnique({
        where: { key: 'banner' }
      });
      // Retorna a config ou um objeto padrão se não for encontrado
      return res.status(200).json(banner || { value: '', isActive: false });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao buscar configurações" });
    }
  }

  // POST: Salvar configurações (Privado)
  else if (method === 'POST') {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: "Não autorizado" });

    try {
      const { value, isActive } = req.body;

      // Validação básica
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: "O campo 'isActive' é obrigatório e deve ser booleano." });
      }

      // Upsert: Cria se não existir, Atualiza se existir
      const config = await prisma.storeConfig.upsert({
        where: { key: 'banner' },
        update: { value, isActive },
        create: { key: 'banner', value, isActive },
      });

      // Revalida a home para atualizar o banner imediatamente
      try {
        await res.revalidate('/');
      } catch (err) {
        console.error('Erro ao revalidar home após salvar config:', err);
      }

      return res.status(200).json(config);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao salvar" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
