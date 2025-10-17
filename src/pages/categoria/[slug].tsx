import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/LoadingSpinner'; 
import { slugify } from '@/lib/utils';
import { PrismaClient, Category, Product, Brand } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { useState } from 'react';
import ProductCard from '@/components/cards/ProductCard';

type CategoryWithChildren = Category & {
  subCategories: Category[];
  products: (Product & { brand: Brand })[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  const categories = await prisma.category.findMany({ select: { name: true } });
  const paths = categories.map((category) => ({
    params: { slug: slugify(category.name) },
  }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<{
  category: CategoryWithChildren | null;
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) return { notFound: true };

  function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return <div className="text-center text-xl text-text-secondary">Categoria não encontrada.</div>;
  }
  
  const prisma = new PrismaClient();
  const currentCategory = await prisma.category.findFirst({
    where: { name: { equals: slug.replace(/-/g, ' '), mode: 'insensitive' } },
  });

  if (!currentCategory) return { notFound: true };

  const categoryWithChildren = await prisma.category.findUnique({
    where: { id: currentCategory.id },
    include: {
      subCategories: true,
      products: { include: { brand: true } },
    },
  });

  if (!categoryWithChildren) {
    return { props: { category: null }, revalidate: 60 };
  }

  return {
    props: {
      category: JSON.parse(JSON.stringify(categoryWithChildren)),
    },
    revalidate: 60,
  };
};

function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!category) {
    return <div className="text-center text-xl text-text-secondary">Carregando...</div>;
  }

  const hasSubCategories = category.subCategories.length > 0;
  const filteredProducts = category.products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEO
        title={category.name}
        description={`Encontre todos os nossos produtos da categoria ${category.name}.`}
      />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary">{category.name}</h1>
      </div>

      {!hasSubCategories && (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {hasSubCategories && category.subCategories.map((subCat) => (
          <Link href={`/categoria/${slugify(subCat.name)}`} key={subCat.id}>
            <div className="group bg-surface-card rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-center items-center text-center border border-surface-border">
              <h2 className="text-xl font-semibold text-text-primary">{subCat.name}</h2>
              <div className="w-1/3 h-1 bg-brand-primary rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        ))}

        {!hasSubCategories && filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!hasSubCategories && filteredProducts.length === 0 && (
        <div className="text-center col-span-full mt-8">
          <p className="text-xl text-text-subtle">Nenhum produto encontrado para a sua busca.</p>
        </div>
      )}
    </>
  );
}

export default CategoryPage;
