import { Prisma } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SEO from '@/components/Seo';
import Link from 'next/link';
import ProductCard from '@/components/cards/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { prisma } from '@/lib/prisma';
import { FaSortAmountDown } from 'react-icons/fa';

// Definir tipo usando Prisma.CategoryGetPayload para garantir tipagem correta nas relações
type CategoryWithDetails = Prisma.CategoryGetPayload<{
  include: {
    subCategories: true;
    products: {
      include: {
        brand: true;
      };
    };
  };
}>;

// 1. GERA OS CAMINHOS ESTÁTICOS (SLUGS)
export const getStaticPaths: GetStaticPaths = async () => {
  let paths: { params: { slug: string } }[] = [];
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true }
    });

    paths = categories
      .map((category) => ({
        // Garante que o slug não seja null
        params: { slug: category.slug! },
      }));
  } catch (error) {
    console.error("Erro ao gerar paths estáticos para categorias:", error);
  }

  return { paths, fallback: 'blocking' };
};

// 2. BUSCA OS DADOS DA CATEGORIA NO SERVIDOR
export const getStaticProps: GetStaticProps<{
  category: CategoryWithDetails | null;
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) return { notFound: true };

  let categoryWithDetails: CategoryWithDetails | null = null;

  try {
    // Busca a categoria pelo slug e inclui subcategorias e produtos
    categoryWithDetails = await prisma.category.findUnique({
      where: { slug: slug },
      include: {
        subCategories: { orderBy: { name: 'asc' } },
        products: {
          include: { brand: true },
          orderBy: { name: 'asc' }
        },
      },
    });

    if (!categoryWithDetails) {
      return { notFound: true }; // Retorna 404 se não encontrar
    }

    // Serializa os dados para evitar erros de Date object no Next.js
    const serializableCategory = JSON.parse(JSON.stringify(categoryWithDetails));

    return {
      props: {
        category: serializableCategory,
      },
      revalidate: 60, // Revalida a cada 60 segundos (ISR)
    };
  } catch (error) {
    console.error(`Erro ao buscar dados da categoria para slug "${slug}":`, error);
    return { notFound: true };
  }
};

// 3. COMPONENTE DA PÁGINA
function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc'); // Estado para a ordenação

  // Exibe spinner de loading durante fallback
  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  // Exibe mensagem se a categoria não foi encontrada
  if (!category) {
    return <div className="text-center text-xl text-text-secondary mt-10">Categoria não encontrada.</div>;
  }

  // Verifica se a categoria atual possui subcategorias
  const hasSubCategories = category.subCategories && category.subCategories.length > 0;

  // Lógica de Filtragem (Busca local)
  let filteredProducts = (category.products || []).filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Lógica de Ordenação (Client-Side)
  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sortOrder) {
      case 'price_asc':
        // Trata nulos como 0 para ordenação
        return (a.price || 0) - (b.price || 0); 
      case 'price_desc':
        return (b.price || 0) - (a.price || 0);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'name_asc':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="animate-fade-in-up">
      <SEO
        title={category.name}
        description={`Encontre todos os nossos produtos da categoria ${category.name}.`}
      />

      {/* Título da Categoria */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary">{category.name}</h1>
      </div>

      {/* Barra de Ferramentas: Busca + Ordenação */}
      {/* Exibido apenas se NÃO tiver subcategorias e TIVER produtos */}
      {!hasSubCategories && category.products && category.products.length > 0 && (
        <div className="mb-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 px-4">
          
          {/* Input de Busca */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome ou código do produto..."
              className="w-full px-4 py-3 border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all bg-surface-card text-text-primary shadow-sm"
            />
          </div>

          {/* Seletor de Ordenação */}
          <div className="w-full md:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
                <FaSortAmountDown />
              </div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full appearance-none pl-10 pr-8 py-3 border border-surface-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all bg-surface-card text-text-primary shadow-sm cursor-pointer"
              >
                <option value="name_asc">Nome (A - Z)</option>
                <option value="name_desc">Nome (Z - A)</option>
                <option value="price_asc">Menor Preço</option>
                <option value="price_desc">Maior Preço</option>
              </select>
              {/* Ícone de seta customizado para o select */}
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text-secondary">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Grid: Exibe subcategorias OU produtos */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${hasSubCategories ? 'justify-items-center' : ''}`}>
        
        {/* Renderiza Subcategorias se existirem */}
        {hasSubCategories && category.subCategories.map((subCat) => (
          <div key={subCat.id} className="w-full max-w-xs animate-fade-in-up" style={{ animationDelay: `${100 + subCat.id * 50}ms` }}>
            {subCat.slug && (
              <Link href={`/categoria/${subCat.slug}`} >
                <div className="group bg-surface-card rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-center items-center text-center border border-surface-border hover:scale-105">
                  <h2 className="text-xl font-semibold text-text-primary">{subCat.name}</h2>
                  <div className="w-1/3 h-1 bg-brand-accent rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </Link>
            )}
          </div>
        ))}

        {/* Renderiza Produtos filtrados e ordenados se NÃO houver subcategorias */}
        {!hasSubCategories && filteredProducts.map((product, index) => (
          <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Mensagem se a busca por produto não retornar nada */}
      {!hasSubCategories && category.products && category.products.length > 0 && filteredProducts.length === 0 && searchTerm && (
        <div className="text-center col-span-full mt-8 animate-fade-in-up">
          <p className="text-xl text-text-subtle">Nenhum produto encontrado para &quot;{searchTerm}&quot;.</p>
        </div>
      )}

      {/* Mensagem se não houver produtos na categoria */}
      {!hasSubCategories && (!category.products || category.products.length === 0) && (
        <div className="text-center col-span-full mt-8 animate-fade-in-up">
          <p className="text-xl text-text-subtle">Ainda não há produtos nesta categoria.</p>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
