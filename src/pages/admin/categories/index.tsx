import { GetServerSideProps } from 'next';
import { getSession } from "next-auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { PrismaClient, Category } from '@prisma/client';
import { FaArrowLeft, FaPlus, FaEdit, FaFolder } from 'react-icons/fa';
import SEO from '@/components/Seo';

type CategoryWithParent = Category & { parent?: Category | null; _count: { products: number } };

export default function AdminCategoriesList({ categories }: { categories: CategoryWithParent[] }) {
  return (
    <div className="animate-fade-in-up">
      <SEO title="Gerenciar Categorias" />
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-surface-border rounded-full transition-colors"><FaArrowLeft /></Link>
          <h1 className="text-3xl font-bold text-text-primary">Categorias</h1>
        </div>
        <Link href="/admin/categories/new" className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md">
          <FaPlus /> Nova Categoria
        </Link>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-border/50 text-text-secondary text-sm uppercase"><th className="p-4">Nome</th><th className="p-4">Pai</th><th className="p-4">Produtos</th><th className="p-4 text-right">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-surface-border/30">
                <td className="p-4 font-medium flex items-center gap-3">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={`Imagem de ${cat.name}`}
                      width={32} // w-8 é 32px
                      height={32}
                      className="w-8 h-8 rounded object-cover"
                    />
                  ) : (
                    <FaFolder className="text-gray-300 w-8 h-8" />
                  )}
                  {cat.name}
                </td>
                <td className="p-4 text-text-secondary">{cat.parent?.name || '-'}</td>
                <td className="p-4 text-text-secondary">{cat._count.products}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/categories/${cat.id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><FaEdit /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/api/auth/signin', permanent: false } };

  const prisma = new PrismaClient();
  const categories = await prisma.category.findMany({
    include: { parent: true, _count: { select: { products: true } } },
    orderBy: { name: 'asc' }
  });
  return { props: { categories: JSON.parse(JSON.stringify(categories)) } };
};