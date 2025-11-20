import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, Category } from '@prisma/client';
import { UploadButton } from '@/utils/uploadthing';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaTrash } from 'react-icons/fa';
import Image from 'next/image';

export default function EditCategory({ category, categories }: { category: Category, categories: Category[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: category.name, imageUrl: category.imageUrl || '', parentId: category.parentId || '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch(`/api/categories/${category.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    router.push('/admin/categories');
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza?")) return;
    const res = await fetch(`/api/categories/${category.id}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/categories');
    else alert("Erro: Verifique se há produtos nesta categoria.");
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <SEO title={`Editar ${category.name}`} />
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/categories" className="p-2 hover:bg-surface-border rounded-full"><FaArrowLeft /></Link>
          <h1 className="text-3xl font-bold">Editar Categoria</h1>
        </div>
        <button onClick={handleDelete} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded flex items-center gap-2"><FaTrash /> Excluir</button>
      </div>

      <form onSubmit={handleUpdate} className="bg-surface-card border border-surface-border rounded-xl p-8 space-y-6">
        <div className="flex justify-center mb-6 border-2 border-dashed border-surface-border rounded-lg p-6">
          {formData.imageUrl ?
            <div className="relative">
              <Image
                src={formData.imageUrl}
                alt="Preview da Categoria"
                width={128}
                height={128}
                className="h-32 w-auto object-contain"
              />
              <button type="button" onClick={() => setFormData({ ...formData, imageUrl: '' })} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs">X</button>
            </div> :
            <UploadButton endpoint="imageUploader" onClientUploadComplete={(res) => setFormData({ ...formData, imageUrl: res[0].url })} />
          }
        </div>

        <div><label className="block mb-1 text-sm">Nome</label><input className="w-full p-2 border rounded bg-surface-background" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>

        <div><label className="block mb-1 text-sm">Categoria Pai</label>
          <select className="w-full p-2 border rounded bg-surface-background" value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: e.target.value })}>
            <option value="">Nenhuma (Categoria Principal)</option>
            {categories.filter(c => c.id !== category.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <button disabled={isLoading} type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-dark flex justify-center items-center gap-2">
          <FaSave /> {isLoading ? 'Salvando...' : 'Atualizar Categoria'}
        </button>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/api/auth/signin', permanent: false } };
  const { id } = context.params as { id: string };
  const prisma = new PrismaClient();
  const category = await prisma.category.findUnique({ where: { id: Number(id) } });
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  if (!category) return { notFound: true };

  return { props: { category: JSON.parse(JSON.stringify(category)), categories: JSON.parse(JSON.stringify(categories)) } };
};