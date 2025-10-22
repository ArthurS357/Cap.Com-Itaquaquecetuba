import { slugify } from '@/lib/utils';
import { PrismaClient, Category, Product, Brand } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import SEO from '@/components/Seo';
import Link from 'next/link';
import ProductCard from '@/components/cards/ProductCard'; 
import LoadingSpinner from '@/components/LoadingSpinner';

type CategoryWithChildren = Category & {
  subCategories: Category[];
  products: (Product & { brand: Brand })[];
};

// Gera os paths para todas as categorias com slug definido
export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  const categories = await prisma.category.findMany({
    where: { slug: { not: undefined } }, // Garante que só categorias com slug sejam consideradas
    select: { slug: true }
  });

  const paths = categories
    .filter(category => category.slug) // Filtra nulos/undefined por segurança
    .map((category) => ({
      params: { slug: category.slug! }, // O '!' assume que slug não será nulo após o filtro
  }));

  return { paths, fallback: 'blocking' }; // Usa 'blocking' para gerar novas páginas no primeiro acesso
};

// Busca os dados da categoria específica (incluindo subcategorias e produtos)
export const getStaticProps: GetStaticProps<{
  category: CategoryWithChildren | null;
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) return { notFound: true }; // Retorna 404 se o slug não for encontrado

  const prisma = new PrismaClient();

  // Busca a categoria pelo slug e inclui suas subcategorias e produtos associados
  const categoryWithChildren = await prisma.category.findUnique({
    where: { slug: slug },
    include: {
      subCategories: { orderBy: { name: 'asc' } }, // Ordena subcategorias por nome
      products: {
        include: { brand: true }, // Inclui a marca de cada produto
        orderBy: { name: 'asc' }  // Ordena produtos por nome
      },
    },
  });

  // Retorna 404 se a categoria não for encontrada no banco
  if (!categoryWithChildren) {
    return { notFound: true };
  }

  // Serializa os dados para evitar problemas com tipos Date no Next.js
  const serializableCategory = JSON.parse(JSON.stringify(categoryWithChildren));

  return {
    props: {
      category: serializableCategory,
    },
    revalidate: 60, // Revalida a página a cada 60 segundos (ISR)
  };
};

// Componente da página que exibe a categoria
function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(''); // Estado para o filtro de produtos

  // Exibe um spinner de loading enquanto a página está sendo gerada (fallback: 'blocking')
  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  // Exibe mensagem se a categoria não foi encontrada após a tentativa de geração
  if (!category) {
    return <div className="text-center text-xl text-text-secondary">Categoria não encontrada.</div>;
  }

  // Verifica se a categoria atual possui subcategorias
  const hasSubCategories = category.subCategories.length > 0;

  // Filtra os produtos baseado no searchTerm (apenas se não houver subcategorias)
  const filteredProducts = category.products.filter((product) =>
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

      {/* Input de busca: Exibido apenas se a categoria NÃO tiver subcategorias e TIVER produtos */}
      {!hasSubCategories && category.products.length > 0 && (
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
          <div key={subCat.id} className="w-full max-w-xs">
            <Link href={`/categoria/${subCat.slug}`} >
              <div className="group bg-surface-card rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-center items-center text-center border border-surface-border hover:scale-105">
                <h2 className="text-xl font-semibold text-text-primary">{subCat.name}</h2>
                {/* Linha azul de destaque no hover usando brand.accent */}
                <div className="w-1/3 h-1 bg-brand-accent rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          </div>
        ))}

        {/* Renderiza Produtos filtrados se NÃO houver subcategorias */}
        {!hasSubCategories && filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Mensagem se a busca por produto não retornar nada */}
      {!hasSubCategories && category.products.length > 0 && filteredProducts.length === 0 && (
        <div className="text-center col-span-full mt-8">
          <p className="text-xl text-text-subtle">Nenhum produto encontrado para "{searchTerm}".</p>
        </div>
      )}

      {/* Mensagem se não houver produtos na categoria (e não houver subcategorias) */}
      {!hasSubCategories && category.products.length === 0 && (
        <div className="text-center col-span-full mt-8">
          <p className="text-xl text-text-subtle">Ainda não há produtos nesta categoria.</p>
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
