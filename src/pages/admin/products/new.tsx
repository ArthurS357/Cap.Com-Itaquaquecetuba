import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Brand, Category } from '@prisma/client';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { prisma } from '@/lib/prisma';
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm';

type PrinterModel = { id: number; modelName: string };

type NewProductProps = {
  brands: Brand[];
  categories: Category[];
  printers: PrinterModel[];
};

export default function NewProduct({ brands, categories, printers }: NewProductProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (formData: ProductFormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Salvando produto...');

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Erro ao criar produto');

      toast.success('Produto criado com sucesso!', { id: loadingToast });
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(msg, { id: loadingToast });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <SEO title="Novo Produto" />
      
      {/* Botão Voltar */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/products" className="p-2 hover:bg-surface-border rounded-full transition-colors">
          <FaArrowLeft />
        </Link>
        <span className="text-text-subtle">Voltar para lista</span>
      </div>

      <ProductForm 
        title="Adicionar Novo Produto"
        brands={brands}
        categories={categories}
        printers={printers}
        onSubmit={handleCreate}
        isLoading={isLoading}
      />
    </div>
  );
}

// getServerSideProps mantém-se idêntico, buscando os dados
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/api/auth/signin', permanent: false } };

  const [brands, categories, printers] = await Promise.all([
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.printer.findMany({ select: { id: true, modelName: true }, orderBy: { modelName: 'asc' } }),
  ]);

  return {
    props: {
      brands: JSON.parse(JSON.stringify(brands)),
      categories: JSON.parse(JSON.stringify(categories)),
      printers: JSON.parse(JSON.stringify(printers)),
    },
  };
};
