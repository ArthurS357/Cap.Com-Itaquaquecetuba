import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Se não estiver logado, redireciona para login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return <LoadingSpinner />;
  }

  if (!session) {
    return null; // Evita piscar conteúdo protegido
  }

  return (
    <div className="min-h-screen p-8 animate-fade-in-up">
      <div className="flex justify-between items-center mb-8 bg-surface-card p-6 rounded-xl border border-surface-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Painel Administrativo</h1>
          <p className="text-text-secondary">Bem-vindo, {session.user?.name}</p>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
        >
          Sair
        </button>
      </div>

      {/* Grid de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card p-6 rounded-xl border border-surface-border hover:border-brand-primary transition-colors cursor-pointer group">
          <h3 className="text-xl font-bold text-brand-primary mb-2 group-hover:underline">Gerenciar Produtos</h3>
          <p className="text-text-secondary mb-4">Adicionar, editar ou remover cartuchos e impressoras.</p>
          <span className="text-sm text-brand-accent font-bold">Em breve &rarr;</span>
        </div>
        
        <div className="bg-surface-card p-6 rounded-xl border border-surface-border opacity-50">
          <h3 className="text-xl font-bold text-text-primary mb-2">Categorias</h3>
          <p className="text-text-secondary">Gerenciar estrutura da loja.</p>
        </div>

        <div className="bg-surface-card p-6 rounded-xl border border-surface-border opacity-50">
           <h3 className="text-xl font-bold text-text-primary mb-2">Configurações</h3>
           <p className="text-text-secondary">Dados da loja e SEO.</p>
        </div>
      </div>
    </div>
  );
}