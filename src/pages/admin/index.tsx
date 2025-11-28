import { GetServerSideProps } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { signOut } from "next-auth/react";
import { FaUserShield, FaBoxOpen, FaSignOutAlt, FaTags, FaCog, FaPrint, FaChartPie, FaLayerGroup } from "react-icons/fa";
import SEO from "@/components/Seo";
import { prisma } from '@/lib/prisma';
import Link from "next/link";
import { ReactNode } from 'react';

// Tipagem para os dados do Dashboard
type DashboardStats = {
  products: number;
  categories: number;
  brands: number;
  printers: number;
};

type AdminDashboardProps = {
  user: { name?: string | null; email?: string | null; image?: string | null };
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

// --- Componentes Auxiliares ---

type StatCardProps = {
  label: string;
  value: number;
  icon: ReactNode;
  color: string;
};

const StatCard = ({ label, value, icon, color }: StatCardProps) => (
  <div className="bg-surface-card border border-surface-border p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-lg text-white ${color} shadow-lg shadow-black/5`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-subtle font-medium uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

type MenuCardProps = {
  href: string;
  title: string;
  desc: string;
  icon: ReactNode;
  theme: 'blue' | 'purple' | 'gray';
};

const MenuCard = ({ href, title, desc, icon, theme }: MenuCardProps) => {
  const themeClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    gray: "bg-gray-50 text-gray-600 group-hover:bg-gray-600 group-hover:text-white"
  };

  return (
    <Link href={href} className="group h-full">
      <div className="bg-surface-card p-6 rounded-xl border border-surface-border hover:border-brand-primary/50 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl transition-colors duration-300 ${themeClasses[theme]}`}>
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
          {title}
        </h3>
        <p className="text-text-secondary text-sm leading-relaxed">
          {desc}
        </p>
      </div>
    </Link>
  );
};

// --- Lógica do Servidor ---

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  const [products, categories, brands, printers] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.brand.count(),
    prisma.printer.count(),
  ]);

  const serializedUser = JSON.parse(JSON.stringify(session.user || { name: 'Admin' }));

  return {
    props: {
      user: serializedUser,
      stats: {
        products,
        categories,
        brands,
        printers
      }
    },
  };
};