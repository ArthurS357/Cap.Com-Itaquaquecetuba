import { PrismaClient, Product, Brand } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getSession } from "next-auth/react"; // Importante para proteger no servidor
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import SEO from '@/components/Seo';

type ProductWithBrand = Product & { brand: Brand };

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Proteção de Rota no Servidor: Se não logado, manda pro login
  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  const prisma = new PrismaClient();
  // Buscar produtos mais recentes primeiro
  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: { id: 'desc' }, 
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};

export default function AdminProductsList({ products }: { products: ProductWithBrand[] }) {
  return (
    <div className="animate-fade-in-up">
      <SEO title="Gerenciar Produtos" />

      {/* Topo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-surface-border rounded-full transition-colors">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Produtos Cadastrados</h1>
        </div>
        
        <Link 
          href="/admin/products/new" 
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold shadow-md"
        >
          <FaPlus /> Novo Produto
        </Link>
      </div>

      {/* Tabela de Listagem */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-border/50 text-text-secondary text-sm uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Imagem</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Marca</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-border/30 transition-colors">
                  <td className="p-4 text-text-subtle">#{product.id}</td>
                  <td className="p-4">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-contain rounded bg-white p-1 border" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-text-primary">{product.name}</td>
                  <td className="p-4 text-text-secondary">{product.brand.name}</td>
                  <td className="p-4 text-xs">
                    <span className="px-2 py-1 rounded-full bg-brand-light text-brand-primary font-semibold">
                      {product.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Editar">
                        <FaEdit />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="p-8 text-center text-text-secondary">
            Nenhum produto encontrado. Clique em "Novo Produto" para começar.
          </div>
        )}
      </div>
    </div>
  );
}