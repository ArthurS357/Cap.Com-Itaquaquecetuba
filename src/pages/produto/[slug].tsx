import { PrismaClient, Prisma, Product, Brand } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import SEO from '@/components/Seo';
import LoadingSpinner from '@/components/LoadingSpinner';
import Image from 'next/image';
import Link from 'next/link';
import ProductCard from '@/components/cards/ProductCard';
import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsappLink } from '@/config/store';

// --- 1. Definição de Tipos ---
type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    compatibleWith: {
      include: {
        printer: {
          select: {
            id: true;
            modelName: true;
          };
        };
      };
    };
  };
}>;

type SimilarProduct = Product & { brand: Brand };

// --- 2. Gerar Paths (getStaticPaths) ---
export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  let paths: { params: { slug: string } }[] = [];

  try {
    const products = await prisma.product.findMany({
      select: { slug: true },
    });

    paths = products
      .filter(product => product.slug)
      .map((product) => ({
        params: { slug: product.slug! },
      }));
  } catch (error) {
    console.error("Erro ao gerar paths estáticos para produtos:", error);
  } finally {
    await prisma.$disconnect();
  }

  return { paths, fallback: 'blocking' };
};

// --- 3. Buscar Dados (getStaticProps) ---
export const getStaticProps: GetStaticProps<{
  product: ProductWithDetails | null;
  similarProducts: SimilarProduct[];
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) {
    return { notFound: true };
  }

  const prisma = new PrismaClient();
  
  try {
    // Busca o produto principal
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        compatibleWith: {
          orderBy: { printer: { modelName: 'asc' } },
          include: {
            printer: {
              select: {
                id: true,
                modelName: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      await prisma.$disconnect();
      return { notFound: true };
    }

    // Busca produtos similares
    const similarProducts = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: product.categoryId },
          { brandId: product.brandId },
        ],
        NOT: { id: product.id },
      },
      take: 4,
      include: {
        brand: true,
      },
    });

    await prisma.$disconnect();

    return {
      props: {
        product: JSON.parse(JSON.stringify(product)),
        similarProducts: JSON.parse(JSON.stringify(similarProducts)),
      },
      revalidate: 60,
    };

  } catch (error) {
    console.error(`Erro ao buscar dados do produto para slug "${slug}":`, error);
    await prisma.$disconnect();
    return { notFound: true };
  }
};

// --- 4. Componente da Página ---
function ProductPage({ product, similarProducts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();

  // Gera o link do WhatsApp usando a função helper
  const whatsappLink = getWhatsappLink();

  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return <div className="text-center text-xl text-text-secondary mt-10">Produto não encontrado.</div>;
  }

  return (
    <div className="animate-fade-in-up">
      <SEO 
        title={product.name} 
        description={product.description || `Encontre ${product.name} na Cap.Com Itaquaquecetuba.`} 
      />

      {/* Grid Principal: Imagem e Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        
        {/* Coluna da Imagem */}
        <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex justify-center items-center h-full max-h-[500px]">
          <Image
            src={product.imageUrl || '/images/logo-capcom.png'} 
            alt={product.name}
            width={400}
            height={400}
            className="object-contain"
            priority
          />
        </div>

        {/* Coluna de Informações */}
        <div className="flex flex-col justify-center">
          <span className="text-brand-accent text-sm font-semibold uppercase">
            {product.brand.name}
          </span>
          <h1 className="text-4xl font-bold text-text-primary mt-2 mb-4">
            {product.name}
          </h1>
          {product.description && (
            <p className="text-lg text-text-secondary mb-6">
              {product.description}
            </p>
          )}
          
          {product.category.slug && (
            <Link href={`/categoria/${product.category.slug}`} className="transition-colors text-sm text-text-subtle hover:text-brand-primary">
              Categoria: {product.category.name}
            </Link>
          )}

          {/* Impressoras Compatíveis */}
          {product.compatibleWith && product.compatibleWith.length > 0 && (
            <div className="mt-8 bg-surface-card border border-surface-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Compatível com:</h3>
              <ul className="list-disc list-inside space-y-1 text-text-secondary text-sm max-h-48 overflow-y-auto">
                {product.compatibleWith.map(({ printer }) => (
                  <li key={printer.id}>{printer.modelName}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botão WhatsApp */}
          <div className="mt-10 pt-6 border-t border-surface-border">
            <p className="text-text-secondary mb-4">
              Não encontrou seu produto? Entre em contato!
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-6 py-3
                         bg-green-600 text-white font-semibold rounded-lg
                         hover:bg-green-700 transition-colors duration-300
                         shadow-lg transform hover:scale-105"
            >
              <FaWhatsapp size={24} />
              <span>Fale Conosco no WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* Produtos Similares */}
      {similarProducts && similarProducts.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">Produtos Similares</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((similarProduct, index) => (
              <div key={similarProduct.id} className="animate-fade-in-up" style={{ animationDelay: `${100 + index * 50}ms` }}>
                <ProductCard product={similarProduct} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProductPage;
