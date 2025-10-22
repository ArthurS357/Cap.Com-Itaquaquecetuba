import { PrismaClient, Brand, Printer, PrinterCompatibility, Product } from '@prisma/client'; 
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { slugify } from '@/lib/utils';
import { useRouter } from 'next/router'; 
import LoadingSpinner from '@/components/LoadingSpinner'; 

// --- Tipo atualizado para incluir cartuchos compatíveis ---
type CompatibleCartridgeInfo = Pick<Product, 'id' | 'name' | 'slug'>; // Apenas os campos necessários do produto

type PrinterWithCartridges = Printer & {
  compatibleCartridges: (PrinterCompatibility & {
    cartridge: CompatibleCartridgeInfo | null; // Produto compatível (pode ser null se algo der errado)
  })[];
};

type BrandWithPrinters = Brand & {
  printers: PrinterWithCartridges[];
};

// --- getStaticPaths (sem alterações) ---
export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  const brands = await prisma.brand.findMany({ select: { name: true } });
  // Gerar slug a partir do nome da marca para os paths
  const paths = brands.map((brand) => ({
    params: { brand: slugify(brand.name) }, // Usar slugify para o parâmetro da rota
  }));
  await prisma.$disconnect(); // Desconectar Prisma
  return { paths, fallback: 'blocking' };
};

// --- getStaticProps (atualizado para incluir produtos compatíveis) ---
export const getStaticProps: GetStaticProps<{
  brand: BrandWithPrinters | null;
}> = async (context) => {
  const brandSlug = context.params?.brand as string;
  if (!brandSlug) return { notFound: true };

  const prisma = new PrismaClient();

  // Encontrar a marca pelo slug (gerado a partir do nome)
  // Precisamos buscar todas as marcas e comparar o slug gerado
  const allBrands = await prisma.brand.findMany();
  const targetBrand = allBrands.find(b => slugify(b.name) === brandSlug);

  if (!targetBrand) {
    await prisma.$disconnect();
    return { notFound: true }; // Retorna 404 se a marca não for encontrada
  }

  // Buscar a marca específica pelo ID encontrado, incluindo impressoras e seus cartuchos compatíveis
  const brandDetails = await prisma.brand.findUnique({
    where: { id: targetBrand.id },
    include: {
      printers: {
        orderBy: { modelName: 'asc' },
        include: {
          compatibleCartridges: {
            include: {
              // Inclui apenas os campos necessários do produto (cartucho)
              cartridge: {
                select: {
                  id: true,
                  name: true,
                  slug: true, // Incluir o slug para o link
                },
              },
            },
            orderBy: { cartridge: { name: 'asc' } }, // Ordena os cartuchos por nome
          },
        },
      },
    },
  });

  await prisma.$disconnect(); // Desconectar Prisma

  // Se mesmo assim não encontrar (improvável, mas seguro verificar)
  if (!brandDetails) {
      return { notFound: true };
  }

  // Serializa os dados
  const serializableBrand = JSON.parse(JSON.stringify(brandDetails));

  return { props: { brand: serializableBrand }, revalidate: 60 };
};

// --- Componente da Página (atualizado para exibir produtos) ---
function BrandPrintersPage({ brand }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  // Mostrar loading durante o fallback 'blocking'
  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  // Mensagem se a marca não for encontrada
  if (!brand) return <div className="text-center text-xl text-text-secondary">Marca de impressora não encontrada.</div>;

  return (
    <>
      <SEO
        title={`Impressoras ${brand.name}`}
        description={`Lista de impressoras da marca ${brand.name} e seus suprimentos compatíveis.`}
      />
      <h1 className="text-4xl font-bold text-center mb-12 text-text-primary animate-fade-in-up">
        Impressoras {brand.name}
      </h1>

      {brand.printers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {brand.printers.map((printer, index) => (
            <div
              key={printer.id}
              className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex flex-col animate-fade-in-up"
              style={{ animationDelay: `${100 + index * 50}ms` }}
            >
              <h2 className="text-xl font-semibold text-text-primary mb-4">{printer.modelName}</h2>

              {/* Lista de Produtos Compatíveis */}
              {printer.compatibleCartridges && printer.compatibleCartridges.length > 0 ? (
                <div>
                  <h3 className="text-md font-medium text-text-secondary mb-2">Suprimentos Compatíveis:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {printer.compatibleCartridges.map(({ cartridge }) => (
                      // Verifica se 'cartridge' e 'cartridge.slug' existem antes de renderizar
                      cartridge && cartridge.slug && (
                        <li key={cartridge.id}>
                          <Link
                            href={`/produto/${cartridge.slug}`}
                            className="text-brand-accent hover:text-brand-primary hover:underline transition-colors"
                          >
                            {cartridge.name}
                          </Link>
                        </li>
                      )
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
         // Mensagem se não houver impressoras cadastradas para a marca
         <div className="col-span-full text-center py-16 px-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
             <p className="text-xl text-text-secondary">Nenhuma impressora encontrada para esta marca ainda.</p>
             <p className="text-text-subtle mt-2">Verifique novamente mais tarde ou navegue por outras categorias.</p>
         </div>
      )}
    </>
  );
}

export default BrandPrintersPage;
