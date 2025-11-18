import { PrismaClient, Prisma } from '@prisma/client';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard';
import { useState } from 'react';
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
};

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

  const selectedBrands = Array.isArray(brandFilter) ? brandFilter : brandFilter ? [brandFilter] : [];
  const selectedTypes = Array.isArray(typeFilter) ? typeFilter : typeFilter ? [typeFilter] : [];

  const prisma = new PrismaClient();
  let results: SearchResultProduct[] = [];
  let allBrands: FilterOption[] = [];
  let allTypes: string[] = [];

  try {
    const brandsData = await prisma.brand.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
    allBrands = brandsData.map(b => ({ id: b.id, name: b.name }));

    const typesData = await prisma.product.findMany({
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' }
    });
    allTypes = typesData.map(t => t.type);

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
    } : {};

    const whereClause: Prisma.ProductWhereInput = {
      AND: [
        textSearchCondition,
        selectedBrands.length > 0 ? {
            brand: { name: { in: selectedBrands } }
        } : {},
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
        
        {/* === BARRA LATERAL DE FILTROS === */}
        <aside className={`
          md:w-1/4 
          ${showMobileFilters ? 'fixed inset-0 z-50 bg-surface-background p-6 overflow-y-auto' : 'hidden md:block'}
        `}>
          <div className="flex justify-between items-center mb-6 md:hidden">
             <h2 className="text-2xl font-bold text-text-primary">Filtros</h2>
             <button onClick={() => setShowMobileFilters(false)} className="text-text-secondary p-2">
               <FaTimes size={24} />
             </button>
          </div>

          <div className="sticky top-24 space-y-8">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-xl text-text-primary hidden md:block">Filtros</h3>
                {(router.query.brand || router.query.type) && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-medium">
                        Limpar tudo
                    </button>
                )}
            </div>

            {/* Filtro por Marca */}
            <div className="bg-surface-card p-4 rounded-lg border border-surface-border">
              <h4 className="font-semibold text-text-primary mb-3">Marca</h4>
              <ul className="space-y-3">
                {brands.map((brand) => (
                  <li key={brand.id}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isBrandSelected(brand.name)}
                        onChange={() => toggleFilter('brand', brand.name)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-accent cursor-pointer"
                      />
                      <span className={`text-sm group-hover:text-brand-primary transition-colors ${isBrandSelected(brand.name) ? 'font-bold text-brand-primary' : 'text-text-secondary'}`}>
                        {brand.name}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            {/* Filtro por Tipo */}
            <div className="bg-surface-card p-4 rounded-lg border border-surface-border">
              <h4 className="font-semibold text-text-primary mb-3">Tipo de Produto</h4>
              <ul className="space-y-3">
                {types.map((type) => (
                  <li key={type}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isTypeSelected(type)}
                        onChange={() => toggleFilter('type', type)}
                        className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-accent cursor-pointer"
                      />
                      <span className={`text-sm group-hover:text-brand-primary transition-colors ${isTypeSelected(type) ? 'font-bold text-brand-primary' : 'text-text-secondary'}`}>
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
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-text-primary">
              {query ? (
                  <>Resultados para: <span className="text-brand-primary">"{query}"</span></>
              ) : (
                  'Todos os Produtos'
              )}
              <span className="text-sm font-normal text-text-subtle ml-3">({results.length} produtos)</span>
            </h1>
            
            <button 
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-surface-card border border-surface-border rounded-lg text-text-primary hover:bg-surface-border transition-colors w-full sm:w-auto justify-center font-medium"
            >
                <FaFilter /> Filtrar
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
                {error}
            </div>
          )}

          {!error && results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((product) => (
                 <div key={product.id}>
                   <ProductCard product={product} />
                 </div>
              ))}
            </div>
          ) : (
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