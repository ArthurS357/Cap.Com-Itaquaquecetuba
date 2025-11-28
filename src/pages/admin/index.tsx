import { GetServerSideProps } from 'next';
import { getSession } from "next-auth/react";
import Link from 'next/link';
import { useState } from 'react';
import { FaArrowLeft, FaPlus, FaEdit, FaSearch, FaBoxOpen, FaFileDownload } from 'react-icons/fa'; // Adicionado FaFileDownload
import SEO from '@/components/Seo';
import Image from 'next/image'; 
import { prisma } from '@/lib/prisma';
import { Product, Brand } from '@prisma/client';
import toast from 'react-hot-toast'; // Adicionado Toast para feedback

type ProductWithBrand = Product & { brand: Brand };

export default function AdminProductsList({ products }: { products: ProductWithBrand[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      product.brand.name.toLowerCase().includes(term) ||
      product.type.toLowerCase().includes(term) ||
      product.id.toString().includes(term)
    );
  });

  // --- FUNÇÃO DE EXPORTAÇÃO  ---
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error("Não há produtos para exportar.");
      return;
    }

    // 1. Cabeçalho do CSV
    // CORREÇÃO 1: Muda "ID" para "Código". O Excel trava se o arquivo começar com "ID".
    const headers = ["Código", "Nome", "Marca", "Tipo", "Preço", "Criado em"];
    
    // 2. Mapear os dados
    const rows = filteredProducts.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`, // Escapar aspas duplas no nome
      `"${p.brand.name.replace(/"/g, '""')}"`, // Escapar aspas na marca
      p.type,
      p.price ? p.price.toString().replace('.', ',') : "0,00", // Formato BR
      new Date(p.createdAt).toLocaleDateString('pt-BR')
    ]);

    // 3. Montar o conteúdo
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    // 4. Criar o Blob e baixar
    // CORREÇÃO 2: Adiciona '\uFEFF' no início. Isso é o BOM, que força o Excel a ler em UTF-8 (corrige acentos).
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `produtos_capcom_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Relatório baixado com sucesso!");
  };

  return (
    <div className="animate-fade-in-up">
      <SEO title="Gerenciar Produtos" />

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 hover:bg-surface-border rounded-full transition-colors text-text-secondary">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Produtos</h1>
            <p className="text-text-secondary text-sm">Gerencie seu catálogo completo</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* BOTÃO EXPORTAR */}
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors font-semibold shadow-sm"
            title="Baixar lista em Excel/CSV"
          >
            <FaFileDownload /> Exportar
          </button>

          <Link 
            href="/admin/products/new" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold shadow-md transform hover:scale-105 duration-200"
          >
            <FaPlus /> Novo
          </Link>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-4 mb-6 shadow-sm flex items-center gap-3">
        <FaSearch className="text-text-subtle" />
        <input 
          type="text" 
          placeholder="Buscar por nome, marca, tipo ou ID..." 
          className="bg-transparent w-full outline-none text-text-primary placeholder-text-subtle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <span className="text-xs text-text-subtle whitespace-nowrap">
            {filteredProducts.length} itens
          </span>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-border/50 text-text-secondary text-sm uppercase tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Imagem</th>
                <th className="p-4">Nome</th>
                <th className="p-4">Marca</th>
                <th className="p-4">Tipo</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-border/30 transition-colors group">
                    <td className="p-4 text-text-subtle font-mono text-xs">#{product.id}</td>
                    <td className="p-4">
                      <div className="w-12 h-12 bg-white rounded-lg border border-surface-border flex items-center justify-center overflow-hidden">
                        {product.imageUrl ? (
                          <Image 
                            src={product.imageUrl} 
                            alt={product.name} 
                            width={48} 
                            height={48} 
                            className="object-contain w-full h-full" 
                          />
                        ) : (
                          <FaBoxOpen className="text-gray-300" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-text-primary">{product.name}</td>
                    <td className="p-4 text-text-secondary">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {product.brand?.name || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <span className="px-2 py-1 rounded-md bg-brand-light/50 text-brand-primary font-semibold border border-brand-light">
                        {product.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" 
                          title="Editar"
                        >
                          <FaEdit />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-secondary">
                    <div className="flex flex-col items-center gap-3">
                      <FaSearch className="text-4xl text-gray-300" />
                      <p>Nenhum produto encontrado para &quot;{searchTerm}&quot;.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    };
  }

  const products = await prisma.product.findMany({
    include: { brand: true },
    orderBy: { id: 'desc' }, 
  });

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
    },
  };
};
