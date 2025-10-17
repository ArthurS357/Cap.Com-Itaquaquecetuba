import { PrismaClient, Category } from '@prisma/client';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SEO from '@/components/Seo'; 
import CategoryCard from '@/components/cards/CategoryCard';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');

export const getStaticProps: GetStaticProps<{
  mainCategories: Category[];
}> = async () => {
  const prisma = new PrismaClient();
  
  const mainCategories = await prisma.category.findMany({
    where: {
      parentId: null,
    },
  });

  return {
    props: {
      mainCategories,
    },
    revalidate: 60,
  };
};

function HomePage({ mainCategories }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <SEO title="Início" />

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary">Bem vindo a Cap.com Itaquaquecetuba</h1>
        <p className="text-2xl text-text-secondary mt-4">Selecione o que procura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {mainCategories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </>
  );
}

export default HomePage;
