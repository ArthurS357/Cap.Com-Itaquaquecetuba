import { PrismaClient, Category } from '@prisma/client';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import CategoryCard from '@/components/cards/CategoryCard';
import Image from 'next/image';

export const getStaticProps: GetStaticProps<{
  mainCategories: Category[];
}> = async () => {
  const prisma = new PrismaClient();

  const allMainCategories = await prisma.category.findMany({
    where: {
      parentId: null,
      slug: { not: undefined }
    },
  });

  const orderedCategories = allMainCategories.sort((a, b) => {
    const order = ['Cartuchos e Toners', 'Tintas', 'Impressoras'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });


  return {
    props: {
      mainCategories: JSON.parse(JSON.stringify(orderedCategories)),
    },
    revalidate: 60,
  };
};

function HomePage({ mainCategories }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <SEO title="Início" />

      {/* ===== SEÇÃO HERO ===== */}
      <section className="relative flex items-center justify-center text-center h-[70vh] mb-16 overflow-hidden text-white">
        {/* Imagem de Fundo */}
        <Image
          src="/images/background-hero.jpg" 
          alt="Fundo da seção de boas-vindas"
          layout="fill"
          objectFit="cover"
          quality={80}
          className="absolute inset-0 z-0"
          priority
        />
        {/* Overlay Escuro */}
        <div className="absolute inset-0 bg-black bg-opacity-60 z-10"></div>

        {/* Conteúdo da Hero Section */}
        <div className="relative z-20 p-6 max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
            Cap.Com Itaquaquecetuba
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 drop-shadow-sm">
            O que você procura? Cartuchos, toners, impressoras e mais!
          </p>
          {/* Botão */}
          <a
             href="#categorias"
             className="inline-block bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 shadow-lg"
          >
            Ver Categorias
          </a>
        </div>
      </section>

      {/* ===== BARRA SEPARADORA ===== */}
      <hr className="border-t-2 border-surface-border max-w-5xl mx-auto my-12" />

      {/* ===== SEÇÃO DAS CATEGORIAS (com id) ===== */}
      <div id="categorias" className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
         <h2 className="text-3xl font-bold text-text-primary">Navegue por Categoria</h2>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-up pb-12" // max-w aumentado para 6xl
        style={{ animationDelay: '300ms' }}
      >
        {mainCategories.map((category, index) => (
          <div key={category.id} className="animate-fade-in-up" style={{ animationDelay: `${300 + index * 100}ms` }}>
             <CategoryCard category={category} />
          </div>
        ))}
      </div>
    </>
  );
}

export default HomePage;
