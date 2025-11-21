import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaBullhorn } from 'react-icons/fa';
import toast from 'react-hot-toast'; // Importar toast

export default function SettingsPage() {
  const [bannerText, setBannerText] = useState('');
  const [bannerActive, setBannerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // remove o estado 'message' pois vai ser usado o toast.

  // Carregar dados iniciais
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setBannerText(data.value || '');
          setBannerActive(data.isActive || false);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Erro ao carregar configurações iniciais.");
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingToast = toast.loading('Salvando configurações...');

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: bannerText, isActive: bannerActive }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Configurações salvas com sucesso!', { id: loadingToast });
      } else {
        throw new Error(data.error || 'Erro ao salvar');
      }
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : 'Erro ao salvar configurações.';
      toast.error(msg, { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      <SEO title="Configurações da Loja" />

      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-surface-border rounded-full transition-colors">
          <FaArrowLeft />
        </Link>
        <h1 className="text-3xl font-bold text-text-primary">Configurações</h1>
      </div>

      <form onSubmit={handleSave} className="bg-surface-card border border-surface-border rounded-xl p-8 shadow-sm space-y-8">

        {/* Seção Banner */}
        <div>
          <div className="flex items-center gap-3 mb-4 border-b border-surface-border pb-2">
            <FaBullhorn className="text-brand-accent" size={24} />
            <h2 className="text-xl font-semibold">Banner de Aviso</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Texto do Banner</label>
              <input
                type="text"
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-surface-border bg-surface-background"
                placeholder="Ex: Frete grátis para Itaquaquecetuba!"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="active"
                checked={bannerActive}
                onChange={(e) => setBannerActive(e.target.checked)}
                className="w-5 h-5 text-brand-primary rounded focus:ring-brand-primary cursor-pointer"
              />
              <label htmlFor="active" className="text-text-primary cursor-pointer select-none">
                Ativar Banner no site
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-brand-primary text-white py-3 rounded-lg font-bold hover:bg-brand-dark flex justify-center items-center gap-2 disabled:opacity-50"
        >
          <FaSave /> {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>

      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) return { redirect: { destination: '/api/auth/signin', permanent: false } };
  return { props: {} };
};
