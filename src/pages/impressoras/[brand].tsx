import { PrismaClient, Brand, Printer } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

type BrandWithPrinters = Brand & {
  printers: Printer[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  const brands = await prisma.brand.findMany({ select: { name: true } });
  const paths = brands.map((brand) => ({
    params: { brand: slugify(brand.name) },
  }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<{
  brand: BrandWithPrinters | null;
}> = async (context) => {
  const brandSlug = context.params?.brand as string;
  if (!brandSlug) return { notFound: true };

  const prisma = new PrismaClient();
  const brand = await prisma.brand.findFirst({
    where: { name: { equals: brandSlug, mode: 'insensitive' } }, // Busca case-insensitive
    include: {
      printers: { orderBy: { modelName: 'asc' } },
    },
  });

  return { props: { brand }, revalidate: 60 };
};

function BrandPrintersPage({ brand }: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!brand) return <div>Marca de impressora não encontrada.</div>;

  return (
    <>
      <SEO
        title={`Impressoras ${brand.name}`}
        description={`Lista de impressoras da marca ${brand.name} e seus suprimentos.`}
      />
      <h1 className="text-4xl font-bold text-center mb-12 text-text-primary">
        Impressoras {brand.name}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {brand.printers.map((printer) => (
          <div key={printer.id} className="bg-surface-card p-4 rounded-lg shadow-sm border border-surface-border">
            <h2 className="text-lg font-semibold text-text-primary">{printer.modelName}</h2>
            {/* Aqui pode adicionar um link para ver os cartuchos compatíveis no futuro */}
          </div>
        ))}
      </div>
    </>
  );
}

export default BrandPrintersPage;