import { useState } from 'react';
import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient, Category } from '@prisma/client';
import { UploadButton } from '@/utils/uploadthing';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Image from 'next/image'; 

export default function NewCategory({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', imageUrl: '', parentId: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    router.push('/admin/categories');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <SEO title="Nova Categoria" />
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories" className="p-2 hover:bg-surface-border rounded-full"><FaArrowLeft /></Link>
        <h1 className="text-3xl font-bold">Nova Categoria</h1>
      </div>
      <form onSubmit={handleSubmit} className="bg-surface-card border border-surface-border rounded-xl p-8 space-y-6">
        {/* Upload */}
        <div className="flex justify-center mb-6 border-2 border-dashed border-surface-border rounded-lg p-6">
            {formData.imageUrl ? (
              <Image // <-- ALTERADO PARA Image
                src={formData.imageUrl} 
                alt="Preview da Categoria"
                width={128} // Necessário para Next/Image
                height={128} // Necessário para Next/Image
                className="h-32 w-auto object-contain" 
              />
            ) : (
              <UploadButton endpoint="imageUploader" onClientUploadComplete={(res) => setFormData({...formData, imageUrl: res[0].url})} />
            )}
        </div>
        
        <div><label className="block mb-1 text-sm">Nome</label><input className="w-full p-2 border rounded bg-surface-background" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
        
        <div><label className="block mb-1 text-sm">Categoria Pai (Opcional)</label>
          <select className="w-full p-2 border rounded bg-surface-background" value={formData.parentId} onChange={e => setFormData({...formData, parentId: e.target.value})}>
            <option value="">Nenhuma (Categoria Principal)</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <button disabled={isLoading} type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-dark flex justify-center items-center gap-2">
          <FaSave /> {isLoading ? 'Salvando...' : 'Salvar Categoria'}
        </button>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/api/auth/signin', permanent: false } };
  const prisma = new PrismaClient();
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return { props: { categories: JSON.parse(JSON.stringify(categories)) } };
};