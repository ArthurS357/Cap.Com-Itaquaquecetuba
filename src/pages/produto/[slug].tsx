import { PrismaClient, Product, Brand, Category, PrinterCompatibility } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import Image from 'next/image';

type ProductDetails = Product & {
  brand: Brand;
  category: Category;
  compatibleWith: PrinterCompatibility[];
};

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({ select: { name: true } });
  const paths = products.map((product) => ({
    params: { slug: slugify(product.name) },
  }));
  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<{
  product: ProductDetails | null;
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) return { notFound: true };

  const prisma = new PrismaClient();
  const allProducts = await prisma.product.findMany();
  const foundProduct = allProducts.find(p => slugify(p.name) === slug);

  if (!foundProduct) return { notFound: true };

  const productDetails = await prisma.product.findUnique({
    where: { id: foundProduct.id },
    include: {
      brand: true,
      category: true,
      compatibleWith: true,
    },
  });

  if (!productDetails) return { notFound: true };

  const serializableProduct = {
    ...productDetails,
    createdAt: productDetails.createdAt.toISOString(),
  };

  return { props: { product: serializableProduct }, revalidate: 60 };
};

function ProductPage({ product }: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!product) return <div>Produto não encontrado.</div>;

  return (
    <>
      <SEO
        title={product.name}
        description={`Detalhes sobre ${product.name}, da marca ${product.brand.name}. Encontre impressoras compatíveis e mais.`}
      />
      
      <div className="bg-surface-card p-6 md:p-8 rounded-xl shadow-md mb-12 flex flex-col md:flex-row items-center gap-8 border border-surface-border">
        {product.imageUrl && (
            <Image
                src={product.imageUrl}
                alt={`Imagem do produto ${product.name}`}
                width={300}
                height={300}
                className="object-cover rounded-lg w-full md:w-1/3"
            />
        )}
        <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{product.name}</h1>
            <p className="text-lg text-text-secondary mt-2"><strong>Marca:</strong> {product.brand.name}</p>
            <p className="text-lg text-text-secondary"><strong>Categoria:</strong> {product.category.name}</p>
            <p className="mt-4 text-text-secondary">{product.description || 'Descrição detalhada em breve.'}</p>
            
            <div className="mt-6 border-2 border-brand-primary/20 bg-brand-light p-6 rounded-xl text-center">
                <p className="text-lg font-semibold text-text-primary">
                    {product.type.includes('RECARGA') ? 'Valor para o serviço de recarga:' : 'Informações sobre este produto:'}
                </p>
                <p className="text-3xl font-bold text-brand-primary mt-2">
                    Consulte via WhatsApp!
                </p>
                <a href="https://wa.me/5511996388426" target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-brand-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300">
                    Iniciar Conversa
                </a>
            </div>
        </div>
      </div>

      {product.compatibleWith.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-text-primary">Impressoras Compatíveis</h2>
          <div className="bg-surface-card p-6 rounded-xl shadow-sm border border-surface-border">
            <ul className="list-disc list-inside columns-1 md:columns-2 lg:columns-3 text-text-secondary gap-x-8">
              {product.compatibleWith.map((comp) => (
                <li key={comp.printerModel} className="mb-2">{comp.printerModel}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductPage;
