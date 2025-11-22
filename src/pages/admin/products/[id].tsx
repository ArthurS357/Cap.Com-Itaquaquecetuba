import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { Brand, Category, Product } from '@prisma/client';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTrash, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { prisma } from '@/lib/prisma'; // Singleton import
import { UploadButton } from '@/utils/uploadthing';

type PrinterModel = { id: number; modelName: string };

// Estendemos o tipo Product para incluir a compatibilidade e os tipos de props
type ProductWithCompatibility = Product & { compatibleWith: { printerId: number }[] };

type EditProductProps = {
  product: ProductWithCompatibility;
  brands: Brand[];
  categories: Category[];
  printers: PrinterModel[]; // NOVO
};

export default function EditProduct({ product, brands, categories, printers }: EditProductProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // Inicializa o array de IDs das impressoras compatíveis
  const initialCompatibleIds = product.compatibleWith.map(c => c.printerId);

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price ? product.price.toString() : '',
    type: product.type,
    brandId: product.brandId,
    categoryId: product.categoryId,
    imageUrl: product.imageUrl || '',
    compatiblePrinterIds: initialCompatibleIds as number[], // NOVO
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Tratamento especial para multi-select
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

      {/* ... Botões de navegação e exclusão (Mantidos) ... */}

      <form onSubmit={handleUpdate} className="bg-surface-card border border-surface-border rounded-xl p-8 shadow-sm space-y-6">

        {/* ... Área de erro e campos básicos (Mantidos) ... */}

        {/* Upload de Imagem (Ajustado para usar toast) */}
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


        {/* ... Campos básicos (Mantidos) ... */}
        {/* ... (omitido) ... */}

        {/* NOVO CAMPO: SELEÇÃO DE IMPRESSORAS COMPATÍVEIS */}
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
          <p className="text-xs text-text-subtle mt-1">Dica: Segure 'Ctrl' ou 'Cmd' para selecionar múltiplos modelos.</p>
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

  // --- NOVO: Usando Promise.all para buscar tudo de uma vez ---
  const [product, brands, categories, printers] = await Promise.all([
    // Busca o produto, incluindo os IDs das impressoras já compatíveis
    prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        brand: true,
        category: true,
        compatibleWith: { select: { printerId: true } } // NOVO INCLUDE
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
      printers: JSON.parse(JSON.stringify(printers)), // NOVO PROP
    },
  };
};