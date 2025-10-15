import { PrismaClient, Product, Brand, Category, PrinterCompatibility } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';

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
  // Precisamos encontrar o produto pelo nome "slugificado"
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

  // Corrigindo a data para serialização
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
      {/* Seção do Produto Principal */}
      <div className="bg-gray-100 p-8 rounded-lg shadow-md mb-12">
        <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
        <p className="text-xl text-gray-600 mt-2"><strong>Marca:</strong> {product.brand.name}</p>
        <p className="text-xl text-gray-600"><strong>Categoria:</strong> {product.category.name}</p>
        {/* Futuramente mostraremos o preço aqui */}
        {/* {product.price && <p className="text-2xl font-bold mt-4">R$ {product.price.toFixed(2)}</p>} */}
        <p className="mt-4 text-gray-700">{product.description || 'Descrição detalhada em breve.'}</p>
      </div>

      {/* Seção de Impressoras Compatíveis */}
      {product.compatibleWith.length > 0 && (
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center">Impressoras Compatíveis</h2>
          <ul className="list-disc list-inside columns-1 md:columns-2 lg:columns-3 bg-white p-6 rounded-lg shadow">
            {product.compatibleWith.map((comp) => (
              <li key={comp.printerModel} className="mb-2">{comp.printerModel}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export default ProductPage;
