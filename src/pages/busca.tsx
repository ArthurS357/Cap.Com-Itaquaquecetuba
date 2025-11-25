import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { productService } from '@/services/productService';

//ReturnType para inferir o tipo de retorno da função do serviço automaticamente
type SearchResultProduct = Awaited<ReturnType<typeof productService.search>>[number];

type FilterOption = {
  id: string | number;
  name: string;
};

// --- Backend (Server Side) ---
export const getServerSideProps: GetServerSideProps<{
  results: SearchResultProduct[];
  query: string;
  brands: FilterOption[];
  types: string[];
  error?: string;
}> = async (context) => {
  const query = (context.query.q as string) || '';
  const brandFilter = context.query.brand;
  const typeFilter = context.query.type;

  const selectedBrands = Array.isArray(brandFilter)
    ? brandFilter
    : brandFilter
    ? [brandFilter]
    : [];
  const selectedTypes = Array.isArray(typeFilter)
    ? typeFilter
    : typeFilter
    ? [typeFilter]
    : [];

  try {
    // 1. Busca Filtros e Produtos em paralelo usando o Service
    const [filters, results] = await Promise.all([
      productService.getFilters(),
      productService.search({
        query,
        brands: selectedBrands,
        types: selectedTypes,
      }),
    ]);

    return {
      props: {
        results: JSON.parse(JSON.stringify(results)),
        query,
        brands: filters.brands,
        types: filters.types,
      },
    };
  } catch (error) {
    console.error('Erro na busca:', error);
    return {
      props: {
        results: [],
        query,
        brands: [],
        types: [],
        error: 'Erro ao buscar dados.',
      },
    };
  }
};

// --- Frontend (Componente) ---
export default function SearchPage({
  results,
  query,
  brands,
  types,
  error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Helpers de UI
  const isBrandSelected = (brandName: string) => {
    const current = router.query.brand;
    if (Array.isArray(current)) return current.includes(brandName);
    return current === brandName;
  };

  const isTypeSelected = (typeName: string) => {
    const current = router.query.type;
    if (Array.isArray(current)) return current.includes(typeName);
    return current === typeName;
  };

  const formatType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Lógica de Navegação/Filtro
  const toggleFilter = (key: 'brand' | 'type', value: string) => {
    const currentQuery = { ...router.query };
    const currentValues = currentQuery[key];

    let newValues: string[] = [];

    if (!currentValues) {
      newValues = [value];
    } else if (typeof currentValues === 'string') {
      newValues = currentValues === value ? [] : [currentValues, value];
    } else {
      newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
    }

    if (newValues.length > 0) {
      currentQuery[key] = newValues;
    } else {
      delete currentQuery[key];
    }

    router.push({ pathname: '/busca', query: currentQuery }, undefined, {
      scroll: false,
    });
  };

  const clearFilters = () => {
    router.push({ pathname: '/busca', query: { q: query } }, undefined, {
      scroll: false,
    });
  };

  return (
    <>
      <SEO
        title={query ? `Busca: "${query}"` : 'Loja'}
        description="Encontre cartuchos, toners e impressoras."
      />

      <div className="flex flex-col md:flex-row gap-8 animate-fade-in-up">
        {/* === SIDEBAR DE FILTROS === */}
        <aside
          className={`
          md:w-1/4 
          ${
            showMobileFilters
              ? 'fixed inset-0 z-50 bg-surface-background p-6 overflow-y-auto'
              : 'hidden md:block'
          }
        `}
        >
          {/* Cabeçalho Mobile */}
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="text-2xl font-bold text-text-primary">Filtros</h2>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-text-secondary p-2"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="sticky top-24 space-y-8">
            {/* Cabeçalho Desktop */}
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xl text-text-primary hidden md:block">
                Filtros
              </h3>
              {(router.query.brand || router.query.type) && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            {/* Grupo: Marca */}
            <div className="bg-surface-card p-4 rounded-lg border border-surface-border shadow-sm">
              <h4 className="font-semibold text-text-primary mb-3 border-b border-surface-border pb-2">
                Marca
              </h4>
              <ul className="space-y-3">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={isBrandSelected(brand.name)}
                        onChange={() => toggleFilter('brand', brand.name)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-accent cursor-pointer"
                      />
                      <span
                        className={`text-sm group-hover:text-brand-primary transition-colors ${
                          isBrandSelected(brand.name)
                            ? 'font-bold text-brand-primary'
                            : 'text-text-secondary'
                        }`}
                      >
                        {brand.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Grupo: Tipo */}
            <div className="bg-surface-card p-4 rounded-lg border border-surface-border shadow-sm">
              <h4 className="font-semibold text-text-primary mb-3 border-b border-surface-border pb-2">
                Tipo de Produto
              </h4>
              <ul className="space-y-3">
                {types.map((type) => (
                  <li key={type}>
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={isTypeSelected(type)}
                        onChange={() => toggleFilter('type', type)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-accent cursor-pointer"
                      />
                      <span
                        className={`text-sm group-hover:text-brand-primary transition-colors ${
                          isTypeSelected(type)
                            ? 'font-bold text-brand-primary'
                            : 'text-text-secondary'
                        }`}
                      >
                        {formatType(type)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* === ÁREA PRINCIPAL === */}
        <div className="flex-1">
          {/* Topo da Lista */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-text-primary">
              {query ? (
                <>
                  Resultados para:{' '}
                  <span className="text-brand-primary">&quot;{query}&quot;</span>
                </>
              ) : (
                'Todos os Produtos'
              )}
              <span className="text-sm font-normal text-text-subtle ml-3">
                ({results.length} produtos)
              </span>
            </h1>

            {/* Botão Mobile */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-surface-card border border-surface-border rounded-lg text-text-primary hover:bg-surface-border transition-colors w-full sm:w-auto justify-center font-medium shadow-sm"
            >
              <FaFilter /> Filtrar
            </button>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center animate-pulse">
              {error}
            </div>
          )}

          {/* Grid de Produtos */}
          {!error && results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            /* Estado Vazio */
            !error && (
              <div className="text-center py-20 bg-surface-card rounded-xl border border-dashed border-surface-border">
                <div className="mb-4 text-gray-300">
                  <FaFilter size={48} className="mx-auto" />
                </div>
                <p className="text-xl text-text-secondary font-semibold">
                  Nenhum produto encontrado.
                </p>
                <p className="text-text-subtle mt-2 max-w-xs mx-auto">
                  Tente remover alguns filtros ou buscar por outro termo mais
                  genérico.
                </p>
                {(router.query.brand || router.query.type) && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-6 py-2 bg-brand-primary text-white rounded-full font-medium hover:bg-brand-dark transition-colors shadow-md"
                  >
                    Limpar todos os filtros
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}