import { PrismaClient, Product, Brand, Printer, PrinterCompatibility } from '@prisma/client';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard';

// Garante que imageUrl está incluído no tipo
type SearchResult = Product & { brand: Brand; imageUrl?: string | null };

// Busca os resultados no lado do servidor a cada requisição
export const getServerSideProps: GetServerSideProps<{
  results: SearchResult[];
  query: string;
}> = async (context) => {
  const query = context.query.q as string || '';
  if (!query) {
    return { props: { results: [], query: '' } };
  }

  const prisma = new PrismaClient();
  console.log(`Buscando por: "${query}"`); 

  let results: SearchResult[] = []; 

  try {
    const matchingPrinters = await prisma.printer.findMany({
      where: {
        modelName: {
          contains: query,
        },
      },
      select: { id: true },
    });
    const printerIds = matchingPrinters.map(p => p.id);

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
      compatibleProductIds = [...new Set(compatibilities.map(c => c.cartridgeId))];
    }

    // 3. Buscar produtos que correspondem à query no nome, descrição, marca OU são compatíveis
    const productResults = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query /*, mode: 'insensitive'*/ } },
          { description: { contains: query /*, mode: 'insensitive'*/ } },
          { brand: { name: { contains: query /*, mode: 'insensitive'*/ } } },
          // Busca por compatibilidade de impressora
          { id: { in: compatibleProductIds } },
        ],
      },
      // Usa select para pegar apenas os campos necessários, incluindo a marca
      select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          price: true,
          type: true,
          brandId: true,
          categoryId: true,
          createdAt: true,
          brand: { // Seleciona apenas o nome da marca
            select: {
              name: true,
              id: true // Inclui ID se precisar em ProductCard
            }
          },
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Remapeia para o tipo SearchResult e garante que createdAt é string
    results = productResults.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      // Garante que brand está no formato esperado por SearchResult/ProductCard
      brand: {
        id: product.brand.id,
        name: product.brand.name,
        // Adiciona arrays vazios se ProductCard esperar products/printers
        products: [],
        printers: []
      }
    }));


  } catch (error) {
      console.error("Erro durante a busca no servidor:", error);
      // Retorna vazio em caso de erro, mas loga o erro no servidor
      return { props: { results: [], query } };
  } finally {
      await prisma.$disconnect(); // Garante que a conexão com o Prisma seja fechada
  }

  const serializableResults = results;


  return { props: { results: serializableResults, query } };
};

// Componente da Página de Resultados de Busca (sem alterações na renderização)
function SearchPage({ results, query }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO title={`Busca por "${query}"`} />
      <h1 className="text-3xl font-bold mb-8 text-text-primary animate-fade-in-up">
        Resultados para: <span className="text-brand-primary">{query}</span>
      </h1>

      {results.length > 0 ? (
        // Grid para exibir os resultados usando ProductCard
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {results.map((product, index) => (
             <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
               {/* Passa o objeto product diretamente para ProductCard */}
               <ProductCard product={product} />
             </div>
          ))}
        </div>
      ) : (
        // Mensagem estilizada para "Nenhum resultado"
        <div className="col-span-full text-center py-16 px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Pode adicionar um SVG de lupa vazia aqui */}
          <p className="text-xl text-text-secondary">Nenhum produto ou impressora encontrado para sua busca.</p>
          <p className="text-text-subtle mt-2">Tente usar termos diferentes ou navegar pelas categorias.</p>
        </div>
      )}
    </>
  );
}

export default SearchPage;