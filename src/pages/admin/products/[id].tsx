import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Brand, Category, Product } from '@prisma/client';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa'; 
import toast from 'react-hot-toast';
import { prisma } from '@/lib/prisma';
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm'; // Importação do componente reutilizável

type PrinterModel = { id: number; modelName: string };
type ProductWithCompatibility = Product & { compatibleWith: { printerId: number }[] };

type EditProductProps = {
  product: ProductWithCompatibility;
  brands: Brand[];
  categories: Category[];
  printers: PrinterModel[];
};

export default function EditProduct({ product, brands, categories, printers }: EditProductProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Lógica de Atualização (PUT) ---
  const handleUpdate = async (formData: ProductFormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Atualizando produto...');

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao atualizar');

      toast.success('Produto atualizado!', { id: loadingToast });
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(msg, { id: loadingToast });
      setIsLoading(false);
    }
  };

  // --- Lógica de Exclusão (DELETE) ---
  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return;

    setIsDeleting(true);
    const loadingToast = toast.loading('Excluindo produto...');

    try {
      const res = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao excluir');

      toast.success('Produto excluído!', { id: loadingToast });
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir';
      toast.error(msg, { id: loadingToast });
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <SEO title={`Editar ${product.name}`} />

      {/* Título e Botão Voltar (Usa FaArrowLeft) */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/products" className="p-2 hover:bg-surface-border rounded-full transition-colors">
          <FaArrowLeft />
        </Link>
        <span className="text-text-subtle">Voltar para lista</span>
      </div>

      {/* Componente Reutilizável (Contém FaSave e FaTrash) */}
      <ProductForm 
        title="Editar Produto"
        initialData={product}
        brands={brands}
        categories={categories}
        printers={printers}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        isLoading={isLoading}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<EditProductProps> = async (context) => {
  const session = await getSession(context);
  const { id } = context.params as { id: string };

  if (!session) return { redirect: { destination: '/api/auth/signin', permanent: false } };

  const [product, brands, categories, printers] = await Promise.all([
    prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        brand: true,
        category: true,
        compatibleWith: { select: { printerId: true } }
      },
    }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.printer.findMany({ select: { id: true, modelName: true }, orderBy: { modelName: 'asc' } }),
  ]);

  if (!product) return { notFound: true };

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      brands: JSON.parse(JSON.stringify(brands)),
      categories: JSON.parse(JSON.stringify(categories)),
      printers: JSON.parse(JSON.stringify(printers)),
    },
  };
};
