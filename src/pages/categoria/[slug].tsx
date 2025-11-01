import { slugify } from '@/lib/utils';
import { PrismaClient, Prisma, Brand } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SEO from '@/components/Seo';
import Link from 'next/link';
import ProductCard from '@/components/cards/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

// Definir tipo usando Prisma.CategoryGetPayload
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

// Gera os paths para todas as categorias com slug definido
export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  let paths: { params: { slug: string } }[] = [];
  try {
      const categories = await prisma.category.findMany({
  select: { slug: true }
});

      paths = categories
        .map((category) => ({
          params: { slug: category.slug! }, // slug! é seguro aqui
      }));
  } catch(error) {
      console.error("Erro ao gerar paths estáticos para categorias:", error);
  } finally {
      await prisma.$disconnect();
  }

  return { paths, fallback: 'blocking' };
};

// Busca os dados da categoria específica
// Ajustar tipo de retorno de getStaticProps
export const getStaticProps: GetStaticProps<{
  category: CategoryWithDetails | null; 
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) return { notFound: true };

  const prisma = new PrismaClient();
  let categoryWithDetails: CategoryWithDetails | null = null;

  try {
      // Busca a categoria pelo slug e inclui suas subcategorias e produtos
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
        await prisma.$disconnect();
        return { notFound: true }; // Retorna 404 se não encontrar
      }

      // Serializa os dados
      const serializableCategory = JSON.parse(JSON.stringify(categoryWithDetails));
      await prisma.$disconnect();

      return {
        props: {
          category: serializableCategory,
        },
        revalidate: 60, // Revalida a cada 60 segundos (ISR)
      };
  } catch (error) {
      console.error(`Erro ao buscar dados da categoria para slug "${slug}":`, error);
      await prisma.$disconnect();
      return { notFound: true }; // Retorna 404 em caso de erro
  }
};

function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

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
  const filteredProducts = (category.products || []).filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in-up"> {/* Animação de entrada */}
      <SEO
        title={category.name}
        description={`Encontre todos os nossos produtos da categoria ${category.name}.`}
      />

      {/* Título da Categoria */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary">{category.name}</h1>
      </div>

      {/* Input de busca: Exibido apenas se NÃO tiver subcategorias e TIVER produtos */}
      {!hasSubCategories && category.products && category.products.length > 0 && (
        <div className="mb-8 max-w-lg mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome ou código do produto..."
            className="w-full px-4 py-3 border-2 border-surface-border rounded-lg focus:outline-none focus:border-brand-primary transition-colors bg-surface-card text-text-primary"
          />
        </div>
      )}

      {/* Grid: Exibe subcategorias OU produtos */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${hasSubCategories ? 'justify-items-center' : ''}`}>
        {/* Renderiza Subcategorias se existirem */}
        {hasSubCategories && category.subCategories.map((subCat) => (
          // Container para limitar a largura e centralizar o card da subcategoria
          <div key={subCat.id} className="w-full max-w-xs animate-fade-in-up" style={{ animationDelay: `${100 + subCat.id * 50}ms` }}>
            {/* Garante que subCat.slug existe antes de criar o Link */}
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

        {/* Renderiza Produtos filtrados se NÃO houver subcategorias */}
        {!hasSubCategories && filteredProducts.map((product, index) => (
          // Passa o tipo correto para ProductCard
          <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
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

      {/* Mensagem se não houver produtos na categoria (e não houver subcategorias) */}
      {!hasSubCategories && (!category.products || category.products.length === 0) && (
        <div className="text-center col-span-full mt-8 animate-fade-in-up">
          <p className="text-xl text-text-subtle">Ainda não há produtos nesta categoria.</p>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
