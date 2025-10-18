import { PrismaClient, Product, Brand } from '@prisma/client';
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

type SearchResult = Product & { brand: Brand };

export const getServerSideProps: GetStaticProps<{ 
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
      name: {
        contains: query, 
      },
    },
    include: { brand: true },
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {results.map((product) => (
            <Link href={`/produto/${slugify(product.name)}`} key={product.id}>
              <div className="group bg-surface-card rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center border border-surface-border">
                <h2 className="text-lg font-semibold text-text-primary">{product.name}</h2>
                <p className="text-sm text-text-subtle mt-2">{product.brand.name}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-lg text-text-secondary">Nenhum produto encontrado.</p>
      )}
    </>
  );
}

export default SearchPage;
