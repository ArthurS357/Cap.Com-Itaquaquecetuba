import { GetServerSideProps } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { signOut } from "next-auth/react";
import { FaUserShield, FaBoxOpen, FaSignOutAlt, FaTags, FaCog, FaPrint, FaChartPie, FaLayerGroup } from "react-icons/fa";
import SEO from "@/components/Seo";
import { prisma } from '@/lib/prisma';
import Link from "next/link"; // Importante importar o Link

// Tipagem
type DashboardStats = {
  products: number;
  categories: number;
  brands: number;
  printers: number;
};

type AdminDashboardProps = {
  user: { name?: string | null; email?: string | null; };
  stats: DashboardStats;
};

export default function AdminDashboard({ user, stats }: AdminDashboardProps) {
  return (
    <div className="animate-fade-in-up space-y-8">
      <SEO title="Painel Admin" description="Visão geral e gerenciamento" />

      {/* Cabeçalho */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-brand-primary/10 text-brand-primary rounded-full ring-4 ring-brand-primary/5">
            <FaUserShield size={32} />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-text-primary">Olá, {user.name || 'Admin'}</h1>
            <p className="text-text-secondary">Gerencie todo o seu catálogo em um só lugar.</p>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-all font-medium text-sm">
          <FaSignOutAlt /> Sair
        </button>
      </div>

      {/* Estatísticas */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <FaChartPie className="text-brand-accent" /> Visão Geral
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Produtos" value={stats.products} icon={<FaBoxOpen />} color="bg-blue-500" />
          <StatCard label="Categorias" value={stats.categories} icon={<FaLayerGroup />} color="bg-purple-500" />
          <StatCard label="Marcas" value={stats.brands} icon={<FaTags />} color="bg-orange-500" />
          <StatCard label="Impressoras" value={stats.printers} icon={<FaPrint />} color="bg-teal-500" />
        </div>
      </div>

      {/* Menu Rápido */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <FaCog className="text-brand-accent" /> Ferramentas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MenuCard href="/admin/products" title="Produtos" desc="Gerenciar catálogo completo." icon={<FaBoxOpen size={24} />} theme="blue" />
          <MenuCard href="/admin/categories" title="Categorias" desc="Organizar departamentos." icon={<FaTags size={24} />} theme="purple" />
          <MenuCard href="/admin/settings" title="Configurações" desc="Avisos e banners." icon={<FaCog size={24} />} theme="gray" />
        </div>
      </div>
    </div>
  );
}

// Componentes Auxiliares
const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-surface-card border border-surface-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
    <div className={`p-3 rounded-lg text-white ${color}`}>{icon}</div>
    <div><p className="text-2xl font-bold text-text-primary">{value}</p><p className="text-xs text-text-subtle uppercase">{label}</p></div>
  </div>
);

const MenuCard = ({ href, title, desc, icon, theme }: any) => {
  const themes: any = { blue: "bg-blue-100 text-blue-600", purple: "bg-purple-100 text-purple-600", gray: "bg-gray-100 text-gray-600" };
  return (
    <Link href={href}>
      <div className="bg-surface-card p-6 rounded-xl border border-surface-border hover:border-brand-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
        <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-4 ${themes[theme]}`}>{icon}</div>
        <h3 className="text-xl font-bold text-text-primary mb-2">{title}</h3>
        <p className="text-text-secondary text-sm">{desc}</p>
      </div>
    </Link>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) return { redirect: { destination: '/api/auth/signin', permanent: false } };

  const [products, categories, brands, printers] = await Promise.all([
    prisma.product.count(), prisma.category.count(), prisma.brand.count(), prisma.printer.count(),
  ]);

  return { props: { user: session.user || { name: 'Admin' }, stats: { products, categories, brands, printers } } };
};
