import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Brand, Category, Product } from '@prisma/client';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTrash, FaExclamationTriangle, FaTimes } from 'react-icons/fa'; // FaTimes adicionado para upload
import toast from 'react-hot-toast';
import { prisma } from '@/lib/prisma';
import { UploadButton } from '@/utils/uploadthing';

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
  const [error, setError] = useState(''); // Estado 'error' é usado no JSX, manter.

  const initialCompatibleIds = product.compatibleWith.map(c => c.printerId);

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price ? product.price.toString() : '',
    type: product.type,
    brandId: product.brandId,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl || '',
    compatiblePrinterIds: initialCompatibleIds as number[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLSelectElement && e.target.name === 'compatiblePrinterIds') {
      const selectedOptions = Array.from(e.target.options)
        .filter(option => option.selected)
        .map(option => Number(option.value));
      setFormData({ ...formData, compatiblePrinterIds: selectedOptions });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const loadingToast = toast.loading('Atualizando produto...');

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar');
      }

      toast.success('Produto atualizado com sucesso!', { id: loadingToast });
      router.push('/admin/products');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro ao atualizar.';
      toast.error(msg, { id: loadingToast });
      setError(msg);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    // Apóstrofos corrigidos aqui:
    if (!confirm('Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.')) return;

    setIsDeleting(true);
    const loadingToast = toast.loading('Excluindo produto...');

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao excluir');
      }

      toast.success('Produto excluído com sucesso!', { id: loadingToast });
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

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Nome do Produto</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Descrição</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-text-secondary mb-1">Preço (R$)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-text-secondary mb-1">Tipo</label>
            <select
              id="type"
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
          <div>
            <label htmlFor="brandId" className="block text-sm font-medium text-text-secondary mb-1">Marca</label>
            <select
              id="brandId"
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

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-text-secondary mb-1">Categoria</label>
            <select
              id="categoryId"
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

        {/* Upload de Imagem (ajustado para usar FaTimes) */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Imagem do Produto</label>

          {formData.imageUrl ? (
            <div className="relative w-40 h-40 border-2 border-surface-border rounded-lg overflow-hidden bg-white flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={formData.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, imageUrl: '' });
                  toast('Imagem removida', { icon: '🗑️' });
                }}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                title="Remover imagem"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-surface-border rounded-lg p-8 flex flex-col items-center justify-center bg-surface-background hover:bg-surface-card transition-colors">
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setFormData({ ...formData, imageUrl: res[0].url });
                    toast.success('Upload de imagem concluído!');
                  }
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Erro no upload: ${error.message}`);
                }}
              />
              <p className="text-xs text-text-subtle mt-2">Suporta: PNG, JPG (máx 4MB)</p>
            </div>
          )}
          <input type="hidden" name="imageUrl" value={formData.imageUrl} />
        </div>

        {/* CAMPO NOVO: SELEÇÃO DE IMPRESSORAS COMPATÍVEIS */}
        <div>
          <label htmlFor="compatiblePrinterIds" className="block text-sm font-medium text-text-secondary mb-1">Modelos de Impressoras Compatíveis</label>
          <select
            id="compatiblePrinterIds"
            name="compatiblePrinterIds"
            multiple={true}
            value={formData.compatiblePrinterIds.map(String)}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary outline-none h-48"
          >
            {printers.map(printer => (
              <option key={printer.id} value={printer.id}>{printer.modelName}</option>
            ))}
          </select>
          {/* Apóstrofos corrigidos aqui: */}
          <p className="text-xs text-text-subtle mt-1">Dica: Segure &apos;Ctrl&apos; ou &apos;Cmd&apos; para selecionar múltiplos modelos.</p>
        </div>


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

export const getServerSideProps: GetServerSideProps<EditProductProps> = async (context) => {
  const session = await getSession(context);
  const { id } = context.params as { id: string };

  if (!session) {
    return { redirect: { destination: '/api/auth/signin', permanent: false } };
  }

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
    prisma.printer.findMany({
      select: { id: true, modelName: true },
      orderBy: { modelName: 'asc' },
    }),
  ]);

  if (!product) {
    return { notFound: true };
  }

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)) as ProductWithCompatibility,
      brands: JSON.parse(JSON.stringify(brands)),
      categories: JSON.parse(JSON.stringify(categories)),
      printers: JSON.parse(JSON.stringify(printers)),
    },
  };
};