import { PrismaClient, Prisma } from '@prisma/client'; 
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import Link from 'next/link'; 
import { slugify } from '@/lib/utils'; 
import { useRouter } from 'next/router';
import LoadingSpinner from '@/components/LoadingSpinner';

type BrandWithPrintersDetails = Prisma.BrandGetPayload<{
  include: {
    printers: { 
      include: {
        compatibleCartridges: { 
          include: {
            cartridge: { 
              select: { 
                id: true;
                name: true;
                slug: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  let paths: { params: { brand: string } }[] = [];
  try {
    const brands = await prisma.brand.findMany({ select: { name: true } });
    paths = brands
      .filter(brand => brand.name) 
      .map((brand) => ({
          params: { brand: slugify(brand.name) }, 
      }));
  } catch (error) {
    console.error("Erro ao gerar paths estáticos para marcas de impressora:", error);
  } finally {
    await prisma.$disconnect(); 
  }
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<{
  brand: BrandWithPrintersDetails | null; // Usa o novo tipo
}> = async (context) => {
  const brandSlug = context.params?.brand as string;
  if (!brandSlug) return { notFound: true };

  const prisma = new PrismaClient();
  let brandDetails: BrandWithPrintersDetails | null = null;

  try {
    const allBrands = await prisma.brand.findMany({ select: { id: true, name: true } });
    const targetBrand = allBrands.find(b => slugify(b.name) === brandSlug);

    if (!targetBrand) {
      await prisma.$disconnect();
      return { notFound: true }; 
    }

    brandDetails = await prisma.brand.findUnique({
      where: { id: targetBrand.id },
      include: {
        printers: {
          orderBy: { modelName: 'asc' },
          include: {
            compatibleCartridges: {
              include: {
                cartridge: {
                  select: { 
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
              orderBy: { cartridge: { name: 'asc' } }, 
            },
          },
        },
      },
    });
    if (!brandDetails) {
        await prisma.$disconnect();
        return { notFound: true };
    }

    const serializableBrand = JSON.parse(JSON.stringify(brandDetails));
    await prisma.$disconnect(); 

    return { props: { brand: serializableBrand }, revalidate: 60 };

  } catch (error) {
    console.error(`Erro ao buscar dados da marca de impressora para slug "${brandSlug}":`, error);
    await prisma.$disconnect();
    return { notFound: true }; 
  }
};

// 4. Ajustar tipo das props do componente
function BrandPrintersPage({ brand }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  // Mostrar loading durante o fallback 'blocking'
  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  // Mensagem se a marca não for encontrada
  if (!brand) {
      return <div className="text-center text-xl text-text-secondary mt-10">Marca de impressora não encontrada.</div>;
  }

  return (
    <>
      <SEO
        title={`Impressoras ${brand.name}`}
        description={`Lista de impressoras da marca ${brand.name} e seus suprimentos compatíveis.`}
      />
      <h1 className="text-4xl font-bold text-center mb-12 text-text-primary animate-fade-in-up">
        Impressoras {brand.name}
      </h1>

      {/* Verifica se existem impressoras antes de mapear */}
      {brand.printers && brand.printers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {brand.printers.map((printer, index) => (
            <div
              key={printer.id}
              className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4">{printer.modelName}</h2>

              {/* Lista de Produtos Compatíveis */}
              {/* Verifica se compatibleCartridges existe e tem itens */}
              {printer.compatibleCartridges && printer.compatibleCartridges.length > 0 ? (
                <div>
                  <h3 className="text-md font-medium text-text-secondary mb-2">Suprimentos Compatíveis:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {printer.compatibleCartridges.map(({ cartridge }) => (
                      // Verifica se 'cartridge' e 'cartridge.slug' existem
                      cartridge?.slug ? ( // Usando optional chaining '?' para segurança extra
                        <li key={cartridge.id}>
                          {/* 6. Usar Link para navegação interna */}
                          <Link
                            href={`/produto/${cartridge.slug}`}
                            className="text-brand-accent hover:text-brand-primary hover:underline transition-colors"
                          >
                            {cartridge.name}
                          </Link>
                        </li>
                      ) : null // Não renderiza se faltar cartucho ou slug
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-text-subtle italic">Nenhum suprimento compatível cadastrado.</p>
              )}
            </div>
          ))}
        </div>
      ) : (
         // Mensagem se não houver impressoras cadastradas
         <div className="col-span-full text-center py-16 px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
             <p className="text-xl text-text-secondary">Nenhuma impressora encontrada para a marca {brand.name} ainda.</p>
             <p className="text-text-subtle mt-2">Verifique novamente mais tarde ou navegue por outras categorias.</p>
         </div>
      )}
    </>
  );
}

export default BrandPrintersPage;
