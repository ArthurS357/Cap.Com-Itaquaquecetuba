import { PrismaClient, Prisma } from '@prisma/client';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard';

// Define o tipo para os resultados da busca, selecionando apenas os campos necessários
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
    // Campos como categoryId, brandId, createdAt não são selecionados
  };
}>;

export const getServerSideProps: GetServerSideProps<{
  results: SearchResultProduct[];
  query: string;
  error?: string;
}> = async (context) => {
  const query = context.query.q as string || '';

  // Retorna vazio se a query for vazia
  if (!query.trim()) {
    return { props: { results: [], query: '' } };
  }

  const prisma = new PrismaClient();
  let results: SearchResultProduct[] = [];

  try {
    console.log(`Buscando por: "${query}"`);

    // Busca IDs de impressoras que correspondem à query
    const matchingPrinters = await prisma.printer.findMany({
      where: {
        modelName: {
          contains: query,
          // mode: 'insensitive', // Descomente para busca case-insensitive (pode afetar performance)
        },
      },
      select: { id: true },
    });
    const printerIds = matchingPrinters.map(p => p.id);

    // Encontra IDs de produtos (cartuchos/toners) compatíveis com as impressoras encontradas
    let compatibleProductIds: number[] = [];
    if (printerIds.length > 0) {
      const compatibilities = await prisma.printerCompatibility.findMany({
        where: {
          printerId: {
            in: printerIds,
          },
        },
        select: { cartridgeId: true },
      });
      // Usa Set para obter apenas IDs únicos de produtos
      compatibleProductIds = [...new Set(compatibilities.map(c => c.cartridgeId))];
    }

    // Busca produtos que:
    // 1. Correspondem à query (nome, descrição, marca)
    // 2. OU são compatíveis com as impressoras encontradas
    const productResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query /*, mode: 'insensitive'*/ } },
          { description: { contains: query /*, mode: 'insensitive'*/ } },
          { brand: { name: { contains: query /*, mode: 'insensitive'*/ } } },
          { id: { in: compatibleProductIds } },
        ],
      },
      // Seleciona os campos necessários para SearchResultProduct
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
        name: 'asc', // Ordena os resultados pelo nome
      }
    });

    results = productResults;

  } catch (error) {
      console.error("Erro durante a busca no servidor:", error);
      // Garante a desconexão em caso de erro
      await prisma.$disconnect();
      // Retorna erro para a página
      return { props: { results: [], query, error: "Ocorreu um erro ao realizar a busca. Tente novamente." } };
  } finally {
      // Garante que a conexão será fechada ao final, mesmo sem erros explícitos no try
      // (embora já esteja no catch, é uma boa prática ter no finally também)
      // No entanto, como o retorno dentro do try/catch já finaliza a função,
      // a desconexão aqui só ocorreria se não houvesse erro e nenhum retorno antecipado.
      // Para garantir, pode-se colocar o disconnect *antes* do return final.
      // await prisma.$disconnect(); // Movido para antes do return final para garantir
  }

  await prisma.$disconnect(); // Garante a desconexão antes de retornar
  return { props: { results: results, query } };
};

// Componente da Página de Resultados de Busca
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

      {/* Exibe mensagem de erro */}
      {error && (
        <div className="col-span-full text-center py-16 px-4 text-red-500 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <p className="text-xl">{error}</p>
        </div>
      )}

      {/* Exibe resultados (se não houver erro e a busca foi feita) */}
      {!error && query && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {results.map((product, index) => (
             <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
               <ProductCard product={product} />
             </div>
          ))}
        </div>
      )}

      {/* Mensagem para nenhum resultado */}
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
