import { PrismaClient, Prisma } from '@prisma/client';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard';

type SearchResultProduct = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    slug: true;
    description: true;
    imageUrl: true;
    price: true;
    type: true;
    brand: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

export const getServerSideProps: GetServerSideProps<{
  results: SearchResultProduct[];
  query: string;
  error?: string;
}> = async (context) => {
  const query = context.query.q as string || '';

  if (!query.trim()) {
    return { props: { results: [], query: '' } };
  }

  const prisma = new PrismaClient();
  let results: SearchResultProduct[] = [];

  try {
    console.log(`Buscando (otimizado) por: "${query}"`);

    // Consulta ÚNICA: Busca produtos que correspondem diretamente
    // OU que são compatíveis com impressoras que correspondem.
    // Adicionado mode: 'insensitive' para busca case-insensitive
    const productResults = await prisma.product.findMany({
      where: {
        OR: [
          // 1. Busca direta no produto (nome, descrição, marca)
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { brand: { name: { contains: query, mode: 'insensitive' } } },
          
          // 2. Busca relacional:
          // Encontra produtos que tenham 'alguma' compatibilidade
          // onde a impressora associada tenha o 'modelName'
          // que contém a string de busca.
          {
            compatibleWith: {
              some: {
                printer: {
                  modelName: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
              },
            },
          },
        ],
      },
      select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          price: true,
          type: true,
          brand: {
            select: {
              id: true,
              name: true,
            }
          },
      },
      orderBy: {
        name: 'asc',
      }
    });

    results = productResults;

  } catch (error) {
      console.error("Erro durante a busca no servidor:", error);
      await prisma.$disconnect();
      return { props: { results: [], query, error: "Ocorreu um erro ao realizar a busca. Tente novamente." } };
  }

  await prisma.$disconnect();
  return { props: { results: results, query } };
};

function SearchPage({ results, query, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO
        title={query ? `Busca por "${query}"` : 'Buscar Produtos'}
        description={`Resultados da busca por "${query}" na Cap.Com Itaquaquecetuba.`}
      />
      <h1 className="text-3xl font-bold mb-8 text-text-primary animate-fade-in-up">
        {query ? (
            <>Resultados para: <span className="text-brand-primary">{query}</span></>
        ) : (
            'Digite algo para buscar'
        )}
      </h1>

      {error && (
        <div className="col-span-full text-center py-16 px-4 text-red-500 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <p className="text-xl">{error}</p>
        </div>
      )}

      {!error && query && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {results.map((product, index) => (
             <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
               <ProductCard product={product} />
             </div>
          ))}
        </div>
      )}

      {!error && query && results.length === 0 && (
        <div className="col-span-full text-center py-16 px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <p className="text-xl text-text-secondary">Nenhum produto ou impressora encontrado para sua busca.</p>
          <p className="text-text-subtle mt-2">Tente usar termos diferentes ou navegar pelas categorias.</p>
        </div>
      )}
    </>
  );
}

export default SearchPage;