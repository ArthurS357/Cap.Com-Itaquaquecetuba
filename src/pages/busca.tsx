import { PrismaClient, Prisma } from '@prisma/client';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard';
import { useState, useEffect } from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

type SearchResultProduct = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    imageUrl: true;
    price: true;
    type: true;
    brand: {
      select: { id: true; name: true };
    };
  };
}>;

type FilterOption = {
  id: string | number;
  name: string;
  count?: number; // Opcional: contagem de produtos (futuro)
};

export const getServerSideProps: GetServerSideProps<{
  results: SearchResultProduct[];
  query: string;
  brands: FilterOption[];
  types: string[];
  error?: string;
}> = async (context) => {
  const query = (context.query.q as string) || '';
  
  // Captura os filtros da URL (podem vir como string ou array de strings)
  const brandFilter = context.query.brand; // ex: 'HP' ou ['HP', 'Epson']
  const typeFilter = context.query.type;

  // Normaliza para array de strings para facilitar o uso no Prisma
  const selectedBrands = Array.isArray(brandFilter) ? brandFilter : brandFilter ? [brandFilter] : [];
  const selectedTypes = Array.isArray(typeFilter) ? typeFilter : typeFilter ? [typeFilter] : [];

  const prisma = new PrismaClient();
  let results: SearchResultProduct[] = [];
  let allBrands: FilterOption[] = [];
  let allTypes: string[] = [];

  try {
    // 1. Buscar opções para os filtros (para preencher a sidebar)
    const brandsData = await prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
    allBrands = brandsData.map(b => ({ id: b.id, name: b.name }));

    // Busca tipos distintos existentes
    const typesData = await prisma.product.findMany({
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' }
    });
    allTypes = typesData.map(t => t.type);


    // 2. Construção da Query Principal
    // A lógica é: (Busca Texto) AND (Filtro Marca) AND (Filtro Tipo)
    
    const textSearchCondition: Prisma.ProductWhereInput = query.trim() ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
        {
          compatibleWith: {
            some: {
              printer: {
                modelName: { contains: query, mode: 'insensitive' },
              },
            },
          },
        },
      ],
    } : {}; // Se não houver busca de texto, não filtra nada aqui

    const whereClause: Prisma.ProductWhereInput = {
      AND: [
        textSearchCondition,
        // Se houver marcas selecionadas, filtra por elas
        selectedBrands.length > 0 ? {
            brand: { name: { in: selectedBrands } }
        } : {},
        // Se houver tipos selecionados, filtra por eles
        selectedTypes.length > 0 ? {
            type: { in: selectedTypes }
        } : {}
      ]
    };

    results = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        imageUrl: true,
        price: true,
        type: true,
        brand: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });

  } catch (error) {
    console.error("Erro na busca:", error);
    await prisma.$disconnect();
    return { props: { results: [], query, brands: [], types: [], error: "Erro ao buscar dados." } };
  }

  await prisma.$disconnect();
  return { props: { results, query, brands: allBrands, types: allTypes } };
};

export default function SearchPage({ results, query, brands, types, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Helpers para verificar se um filtro está ativo
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

  // Função para alternar filtros na URL
  const toggleFilter = (key: 'brand' | 'type', value: string) => {
    const currentQuery = { ...router.query };
    let currentValues = currentQuery[key];

    let newValues: string[] = [];
    
    if (!currentValues) {
      newValues = [value];
    } else if (typeof currentValues === 'string') {
      newValues = currentValues === value ? [] : [currentValues, value];
    } else {
      newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
    }

    // Atualiza a URL mantendo a busca (q) e outros parametros
    if (newValues.length > 0) {
      currentQuery[key] = newValues;
    } else {
      delete currentQuery[key];
    }

    router.push({ pathname: '/busca', query: currentQuery }, undefined, { scroll: false });
  };

  const clearFilters = () => {
    router.push({ pathname: '/busca', query: { q: query } }, undefined, { scroll: false });
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <SEO
        title={query ? `Busca: "${query}"` : 'Loja'}
        description="Encontre cartuchos, toners e impressoras."
      />

      <div className="flex flex-col md:flex-row gap-8 animate-fade-in-up">
        
        {/* === BARRA LATERAL DE FILTROS (Desktop & Mobile Toggle) === */}
        <aside className={`
          md:w-1/4 
          ${showMobileFilters ? 'fixed inset-0 z-50 bg-surface-background p-6 overflow-y-auto' : 'hidden md:block'}
        `}>
          <div className="flex justify-between items-center mb-6 md:hidden">
             <h2 className="text-2xl font-bold text-text-primary">Filtros</h2>
             <button onClick={() => setShowMobileFilters(false)} className="text-text-secondary">
               <FaTimes size={24} />
             </button>
          </div>

          <div className="sticky top-24 space-y-8">
            {/* Cabeçalho Filtros Desktop */}
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-text-primary hidden md:block">Filtros</h3>
                {(router.query.brand || router.query.type) && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
                        Limpar tudo
                    </button>
                )}
            </div>

            {/* Filtro por Marca */}
            <div>
              <h4 className="font-semibold text-text-secondary mb-3">Marca</h4>
              <ul className="space-y-2">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isBrandSelected(brand.name)}
                        onChange={() => toggleFilter('brand', brand.name)}
                        className="w-4 h-4 rounded border-surface-border text-brand-primary focus:ring-brand-accent"
                      />
                      <span className={`text-sm group-hover:text-brand-primary transition-colors ${isBrandSelected(brand.name) ? 'font-bold text-brand-primary' : 'text-text-subtle'}`}>
                        {brand.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filtro por Tipo */}
            <div>
              <h4 className="font-semibold text-text-secondary mb-3">Tipo de Produto</h4>
              <ul className="space-y-2">
                {types.map((type) => (
                  <li key={type}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isTypeSelected(type)}
                        onChange={() => toggleFilter('type', type)}
                        className="w-4 h-4 rounded border-surface-border text-brand-primary focus:ring-brand-accent"
                      />
                      <span className={`text-sm group-hover:text-brand-primary transition-colors ${isTypeSelected(type) ? 'font-bold text-brand-primary' : 'text-text-subtle'}`}>
                        {formatType(type)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* === CONTEÚDO PRINCIPAL === */}
        <div className="flex-1">
          
          {/* Cabeçalho da Listagem */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-text-primary">
              {query ? (
                  <>Resultados para: <span className="text-brand-primary">"{query}"</span></>
              ) : (
                  'Todos os Produtos'
              )}
              <span className="text-sm font-normal text-text-subtle ml-3">({results.length} produtos)</span>
            </h1>
            
            {/* Botão Mobile para abrir filtros */}
            <button 
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-surface-card border border-surface-border rounded-lg text-text-secondary hover:bg-surface-border transition-colors w-full sm:w-auto justify-center"
            >
                <FaFilter /> Filtrar
            </button>
          </div>

          {/* Tratamento de Erros */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
                {error}
            </div>
          )}

          {/* Grid de Produtos */}
          {!error && results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
                 <div key={product.id}>
                   <ProductCard product={product} />
                 </div>
              ))}
            </div>
          ) : (
            /* Estado Vazio */
            !error && (
                <div className="text-center py-20 bg-surface-card rounded-xl border border-dashed border-surface-border">
                <p className="text-xl text-text-secondary font-semibold">Nenhum produto encontrado.</p>
                <p className="text-text-subtle mt-2">Tente remover alguns filtros ou buscar por outro termo.</p>
                {(router.query.brand || router.query.type) && (
                    <button onClick={clearFilters} className="mt-4 text-brand-primary font-medium hover:underline">
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