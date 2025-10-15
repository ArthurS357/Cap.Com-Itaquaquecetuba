import { PrismaClient, Category } from '@prisma/client';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// Função para converter o nome da categoria em um formato amigável para URL (ex: "Cartuchos e Toners" -> "cartuchos-e-toners")
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-') // Substitui espaços por -
    .replace(/[^\w-]+/g, ''); // Remove caracteres especiais

export const getStaticProps: GetStaticProps<{
  mainCategories: Category[];
}> = async () => {
  const prisma = new PrismaClient();
  
  // Buscamos apenas as categorias principais 
  const mainCategories = await prisma.category.findMany({
    where: {
      parentId: null,
    },
  });

  return {
    props: {
      mainCategories,
    },
    revalidate: 60, // Revalida a cada 60 segundos
  };
};

function HomePage({ mainCategories }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Bem vindo a Cap.com Itaquaquecetuba</h1>
        <p className="text-2xl text-gray-700 mt-4">Selecione o que procura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {mainCategories.map((category) => (
          <Link
            href={`/categoria/${slugify(category.name)}`}
            key={category.id}
          >
            <div className="border rounded-lg p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all cursor-pointer flex flex-col items-center text-center">
              {category.imageUrl && (
                <Image
                  src={category.imageUrl}
                  alt={`Imagem para a categoria ${category.name}`}
                  width={250}
                  height={250}
                  className="object-cover mb-4 rounded-md"
                />
              )}
              <h2 className="text-2xl font-semibold">{category.name}</h2>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default HomePage;
