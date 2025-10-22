import { PrismaClient, Product, Brand } from '@prisma/client';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'; 
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard'; 


// Garante que imageUrl está incluído no tipo
type SearchResult = Product & { brand: Brand; imageUrl?: string | null };

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

  const results = await prisma.product.findMany({
    where: {
      // Busca pode ser melhorada para incluir descrição, slug, etc.
      name: {
        contains: query,
        mode: 'insensitive', // Busca case-insensitive
      },
    },
    include: { brand: true }, // Inclui a marca
    // Garante que imageUrl seja selecionado se existir no modelo
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

  // Converte datas para string para serialização (necessário em getServerSideProps/getStaticProps)
  const serializableResults = results.map(product => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
  }));


  return { props: { results: serializableResults, query } };
};

function SearchPage({ results, query }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <SEO title={`Busca por "${query}"`} />
      <h1 className="text-3xl font-bold mb-8 text-text-primary">
        Resultados para: <span className="text-brand-primary">{query}</span>
      </h1>

      {results.length > 0 ? (
        // Usa o mesmo grid layout das outras páginas
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {results.map((product) => (
            // Usa o ProductCard importado
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-lg text-text-secondary">Nenhum produto encontrado.</p>
      )}
    </>
  );
}

export default SearchPage;
