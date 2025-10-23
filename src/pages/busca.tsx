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
    // Campos como categoryId, brandId, createdAt foram removidos do select, então não estão aqui
  };
}>;


export const getServerSideProps: GetServerSideProps<{
  results: SearchResultProduct[]; 
  query: string;
  error?: string; 
}> = async (context) => {
  const query = context.query.q as string || '';

  // Retorna vazio imediatamente se a query estiver vazia ou só espaços
  if (!query.trim()) {
    return { props: { results: [], query: '' } };
  }

  const prisma = new PrismaClient();
  let results: SearchResultProduct[] = []; 

  try {
    console.log(`Buscando por: "${query}"`);

    // --- Passo 1: Buscar impressoras que correspondem à query ---
    const matchingPrinters = await prisma.printer.findMany({
      where: {
        modelName: {
          contains: query,
          // mode: 'insensitive', // Descomente para busca case-insensitive (pode afetar performance)
        },
      },
      select: { id: true }, // Seleciona apenas o ID da impressora
    });
    const printerIds = matchingPrinters.map(p => p.id);

    // --- Passo 2: Encontrar IDs de produtos (cartuchos/toners) compatíveis ---
    let compatibleProductIds: number[] = [];
    if (printerIds.length > 0) {
      const compatibilities = await prisma.printerCompatibility.findMany({
        where: {
          printerId: {
            in: printerIds, // Busca compatibilidades para as impressoras encontradas
          },
        },
        select: { cartridgeId: true }, // Seleciona apenas o ID do produto compatível
      });
      // Usa Set para obter apenas IDs únicos de produtos
      compatibleProductIds = [...new Set(compatibilities.map(c => c.cartridgeId))];
    }

    // --- Passo 3: Buscar produtos que correspondem à query OU são compatíveis ---
    const productResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query /*, mode: 'insensitive'*/ } }, // Busca no nome do produto
          { description: { contains: query /*, mode: 'insensitive'*/ } }, // Busca na descrição
          { brand: { name: { contains: query /*, mode: 'insensitive'*/ } } }, // Busca no nome da marca
          { id: { in: compatibleProductIds } }, // Busca produtos compatíveis encontrados no Passo 2
        ],
      },
      // Seleciona apenas os campos necessários para o tipo SearchResultProduct e ProductCard
      select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          price: true,
          type: true,
          brand: { // Inclui a marca relacionada
            select: {
              id: true,
              name: true,
            }
          },
          // categoryId, brandId, createdAt não são mais selecionados
      },
      orderBy: {
        name: 'asc' // Ordena os resultados pelo nome do produto
      }
    });

    // Os resultados da consulta já correspondem ao tipo SearchResultProduct devido ao 'select'
    results = productResults;

  } catch (error) {
      // Em caso de erro na comunicação com o banco ou outro erro inesperado
      console.error("Erro durante a busca no servidor:", error);
      // Garante a desconexão em caso de erro
      await prisma.$disconnect();
      // Retorna resultados vazios e uma mensagem de erro para ser exibida na página
      return { props: { results: [], query, error: "Ocorreu um erro ao realizar a busca. Tente novamente." } };
  } finally {
  }
  return { props: { results: results, query } }; // Passa os resultados diretamente
};

// Componente da Página de Resultados de Busca
// 5. Ajustar tipo das props
function SearchPage({ results, query, error }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO
        title={query ? `Busca por "${query}"` : 'Buscar Produtos'}
        description={`Resultados da busca por "${query}" na Cap.Com Itaquaquecetuba.`}
      />
      <h1 className="text-3xl font-bold mb-8 text-text-primary animate-fade-in-up">
        {/* Mostra o termo buscado ou uma mensagem padrão se a busca estiver vazia */}
        {query ? (
            <>Resultados para: <span className="text-brand-primary">{query}</span></>
        ) : (
            'Digite algo para buscar'
        )}
      </h1>

      {/* Exibe mensagem de erro, se houver */}
      {error && (
        <div className="col-span-full text-center py-16 px-4 text-red-500 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <p className="text-xl">{error}</p>
        </div>
      )}

      {/* Exibe resultados apenas se não houver erro E a busca foi realizada (query não vazia) */}
      {!error && query && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {results.map((product, index) => (
             <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
               {/* O tipo SearchResultProduct é compatível com o esperado por ProductCard */}
               <ProductCard product={product} />
             </div>
          ))}
        </div>
      )}

      {/* Mensagem para "Nenhum resultado" (apenas se não houver erro E a busca foi realizada E não houve resultados) */}
      {!error && query && results.length === 0 && (
        <div className="col-span-full text-center py-16 px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Pode adicionar um SVG de lupa vazia aqui depois */}
          <p className="text-xl text-text-secondary">Nenhum produto ou impressora encontrado para sua busca.</p>
          <p className="text-text-subtle mt-2">Tente usar termos diferentes ou navegar pelas categorias.</p>
        </div>
      )}
    </>
  );
}

export default SearchPage;

