import { PrismaClient, Category } from '@prisma/client';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import SEO from '@/components/Seo'; 

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
      {/* Adicionando o título da página para SEO */}
      <SEO title="Início" />

      <div className="text-center mb-12">
        {/*Aplicando as novas cores de texto */}
        <h1 className="text-4xl font-bold text-text-primary">Bem vindo a Cap.com Itaquaquecetuba</h1>
        <p className="text-2xl text-text-secondary mt-4">Selecione o que procura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {mainCategories.map((category) => (
          <Link
            href={`/categoria/${slugify(category.name)}`}
            key={category.id}
          >
            {/* Aplicando o novo design para os cards */}
            <div className="group bg-surface-card rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center border border-surface-border">
              {category.imageUrl && (
                <Image
                  src={category.imageUrl}
                  alt={`Imagem para a categoria ${category.name}`}
                  width={250}
                  height={250}
                  className="object-cover mb-6 rounded-md"
                />
              )}
              <h2 className="text-2xl font-semibold text-text-primary">{category.name}</h2>
              {/* Detalhe visual que aparece no hover */}
              <div className="w-1/3 h-1 bg-brand-primary rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default HomePage;