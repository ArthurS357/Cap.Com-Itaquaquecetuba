import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, Brand, Category, Product } from '@prisma/client';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

// --- FIX: Prisma Singleton (Evita travar o banco em desenvolvimento) ---
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
// ----------------------------------------------------------------------

type EditProductProps = {
  product: Product;
  brands: Brand[];
  categories: Category[];
};

export default function EditProduct({ product, brands, categories }: EditProductProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Estado inicial com os dados do produto
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price ? product.price.toString() : '',
    type: product.type,
    brandId: product.brandId,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Função de Atualizar (PUT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao atualizar');
      }

      // Redireciona após sucesso
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Função de Deletar (DELETE)
  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir');
      }

      router.push('/admin/products');
    } catch (err: any) {
      alert(err.message);
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <SEO title={`Editar ${product.name}`} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-surface-border rounded-full transition-colors">
            <FaArrowLeft />
          </Link>
          <h1 className="text-3xl font-bold text-text-primary">Editar Produto</h1>
        </div>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors font-semibold border border-red-200"
        >
          {isDeleting ? 'Excluindo...' : <><FaTrash /> Excluir</>}
        </button>
      </div>

      <form onSubmit={handleUpdate} className="bg-surface-card border border-surface-border rounded-xl p-8 shadow-sm space-y-6">
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle className="flex-shrink-0" /> 
            <span>{error}</span>
          </div>
        )}

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Nome do Produto</label>
          <input
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
          <textarea
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preço */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Preço (R$)</label>
            <input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
            >
              <option value="TONER">Toner</option>
              <option value="IMPRESSORA">Impressora</option>
              <option value="RECARGA_JATO_TINTA">Cartucho de Tinta</option>
              <option value="TINTA_REFIL">Refil de Tinta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Marca</label>
            <select
              name="brandId"
              required
              value={formData.brandId}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* URL Imagem */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">URL da Imagem</label>
          <input
            name="imageUrl"
            type="text"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading || isDeleting}
            className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-lg hover:bg-brand-dark transition-colors font-bold shadow-md disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : <><FaSave /> Atualizar Produto</>}
          </button>
        </div>

      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { id } = context.params as { id: string };

  // Proteção de Rota
  if (!session) {
    return { redirect: { destination: '/api/auth/signin', permanent: false } };
  }

  // --- FIX: Usar a instância global do Prisma (não criar uma nova) ---
  // Busca tudo em paralelo para ser rápido
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: Number(id) } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      // JSON.parse(JSON.stringify(...)) é necessário para serializar objetos Date do Prisma
      product: JSON.parse(JSON.stringify(product)),
      brands: JSON.parse(JSON.stringify(brands)),
      categories: JSON.parse(JSON.stringify(categories)),
    },
  };
};