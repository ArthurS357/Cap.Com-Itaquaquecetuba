import { PrismaClient, Category, Product, Brand } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Image from 'next/image';

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

  return {
    props: {
      category: categoryWithChildren,
    },
    revalidate: 60,
  };
};

function CategoryPage({ category }: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!category) {
    return <div>Categoria não encontrada.</div>;
  }

  const hasSubCategories = category.subCategories.length > 0;

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">{category.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {hasSubCategories && category.subCategories.map((subCat) => (
          <Link href={`/categoria/${slugify(subCat.name)}`} key={subCat.id}>
            <div className="border rounded-lg p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full flex flex-col justify-center items-center text-center">
              <h2 className="text-xl font-semibold">{subCat.name}</h2>
            </div>
          </Link>
        ))}

        {!hasSubCategories && category.products.map((product) => (
          <Link href={`/produto/${slugify(product.name)}`} key={product.id}>
            <div className="border rounded-lg p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full flex flex-col justify-between items-center text-center">
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
    </>
  );
}

export default CategoryPage;
