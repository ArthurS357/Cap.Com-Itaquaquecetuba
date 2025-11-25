import { useSession, signOut } from "next-auth/react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { FaUserShield, FaBoxOpen, FaSignOutAlt, FaTags, FaCog } from "react-icons/fa";
import SEO from "@/components/Seo";

export default function AdminDashboard() {
  const { data: session, status } = useSession();

  // Exibe o spinner enquanto o NextAuth verifica a sessão no cliente
  if (status === "loading") {
    return <LoadingSpinner />;
  }

  // Proteção extra: se o middleware falhar ou o usuário for deslogado na página, não exibe nada
  if (!session) {
    return null;
  }

  return (
    <div className="animate-fade-in-up">
      <SEO title="Painel Admin" description="Área restrita" />

      {/* Cabeçalho Exclusivo do Admin */}
      <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-8 mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-brand-primary text-white rounded-full shadow-lg">
            <FaUserShield size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Área Administrativa</h1>
            <p className="text-text-secondary">
              Logado como: <span className="font-semibold text-brand-primary">{session.user?.email}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium shadow-sm"
        >
          <FaSignOutAlt />
          Sair do Sistema
        </button>
      </div>

      {/* Grid de Ferramentas */}
      <h2 className="text-xl font-bold text-text-primary mb-6 px-2 border-l-4 border-brand-accent pl-3">
        Gerenciamento
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Card: Produtos */}
        <Link href="/admin/products" className="group">
          <div className="bg-surface-card p-6 rounded-xl border border-surface-border hover:border-brand-primary hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FaBoxOpen size={24} />
              </div>
              <span className="text-xs font-bold text-text-subtle uppercase tracking-wide">Principal</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Produtos</h3>
            <p className="text-text-secondary text-sm">
              Adicionar, editar preços e gerenciar estoque de cartuchos e impressoras.
            </p>
          </div>
        </Link>

        {/* Card: Categorias */}
        <Link href="/admin/categories" className="group">
          <div className="bg-surface-card p-6 rounded-xl border border-surface-border hover:border-brand-primary hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FaTags size={24} />
              </div>
              <span className="text-xs font-bold text-text-subtle uppercase tracking-wide">Estrutura</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Categorias</h3>
            <p className="text-text-secondary text-sm">
              Organizar departamentos, criar novas categorias e subcategorias.
            </p>
          </div>
        </Link>

        {/* Card: Configurações */}
        <Link href="/admin/settings" className="group">
          <div className="bg-surface-card p-6 rounded-xl border border-surface-border hover:border-brand-primary hover:shadow-md transition-all cursor-pointer h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-600 group-hover:text-white transition-colors">
                <FaCog size={24} />
              </div>
              <span className="text-xs font-bold text-text-subtle uppercase tracking-wide">Geral</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">Configurações</h3>
            <p className="text-text-secondary text-sm">
              Gerenciar banner de avisos e promoções da loja.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}