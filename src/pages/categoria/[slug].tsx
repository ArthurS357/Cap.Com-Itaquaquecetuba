import { PrismaClient, Category, Product, Brand } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type CategoryWithChildren = Category & {
  subCategories: Category[];
  products: (Product & { brand: Brand })[];
};

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

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

  const prisma = new PrismaClient();
  const categories = await prisma.category.findMany();
  const currentCategory = categories.find((cat) => slugify(cat.name) === slug);

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

  const serializableProducts = categoryWithChildren.products.map(product => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
  }));

  const serializableCategory = {
    ...categoryWithChildren,
    products: serializableProducts,
  };

  return {
    props: {
      category: serializableCategory,
    },
    revalidate: 60,
  };
};


function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!category) {
    return <div>Categoria não encontrada.</div>;
  }

  const hasSubCategories = category.subCategories.length > 0;
  const filteredProducts = category.products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <SEO title="Início" />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">{category.name}</h1>
      </div>

      {!hasSubCategories && (
        <div className="mb-8 max-w-lg mx-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome ou código do produto..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {hasSubCategories && category.subCategories.map((subCat) => (
          <Link href={`/categoria/${slugify(subCat.name)}`} key={subCat.id}>
            <div className="bg-surface-card rounded-lg p-6 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full flex flex-col justify-center items-center text-center border-2 border-transparent hover:border-brand-primary">
              <h2 className="text-xl font-semibold">{subCat.name}</h2>
            </div>
          </Link>
        ))}

        {!hasSubCategories && filteredProducts.map((product) => (
          <Link href={`/produto/${slugify(product.name)}`} key={product.id}>
            <div className="bg-surface-card rounded-lg p-4 shadow-md hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full flex flex-col justify-between items-center text-center border-2 border-transparent hover:border-brand-primary">
              {product.imageUrl && (
                <Image src={product.imageUrl} alt={product.name} width={200} height={200} className="object-cover mb-4" />
              )}
              <div>
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-2">{product.brand.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!hasSubCategories && filteredProducts.length === 0 && (
        <div className="text-center col-span-full mt-8">
          <p className="text-xl text-gray-500">Nenhum produto encontrado para a sua busca.</p>
        </div>
      )}
    </>
  );
}

export default CategoryPage;