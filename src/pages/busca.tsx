import { PrismaClient, Product, Brand } from '@prisma/client';
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
  // Retorna imediatamente se não houver termo de busca
  if (!query) {
    return { props: { results: [], query: '' } };
  }

  const prisma = new PrismaClient();
  console.log(`Buscando por: "${query}"`); // Log no servidor

  const results = await prisma.product.findMany({
    where: {
      // Busca no nome do produto (case-insensitive)
      name: {
        contains: query,
        mode: 'insensitive',
      },
      // Adicionar OR para buscar na descrição, slug, marca, etc.
      // OR: [
      //   { name: { contains: query, mode: 'insensitive' } },
      //   { description: { contains: query, mode: 'insensitive' } },
      //   { brand: { name: { contains: query, mode: 'insensitive' } } }
      // ]
    },
    include: { brand: true }, // Inclui dados da marca
    // Seleciona os campos necessários, incluindo imageUrl
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
        brand: true,
    }
  });

  // Converte datas para string para serialização
  const serializableResults = results.map(product => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
  }));

  return { props: { results: serializableResults, query } };
};

// Componente da Página de Resultados de Busca
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
               <ProductCard product={product} />
             </div>
          ))}
        </div>
      ) : (
        // Mensagem estilizada para "Nenhum resultado"
        <div className="col-span-full text-center py-16 px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Pode adicionar um SVG de lupa vazia aqui */}
          <p className="text-xl text-text-secondary">Nenhum produto encontrado para sua busca.</p>
          <p className="text-text-subtle mt-2">Tente usar termos diferentes ou navegar pelas categorias.</p>
        </div>
      )}
    </>
  );
}

export default SearchPage;
