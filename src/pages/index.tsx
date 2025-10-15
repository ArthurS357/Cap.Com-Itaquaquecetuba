import type { InferGetStaticPropsType, GetStaticProps } from 'next';
import { PrismaClient, Product, Brand, Category } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

type ProductWithDetails = Product & {
  brand: Brand;
  category: Category;
};

export const getStaticProps: GetStaticProps<{ products: ProductWithDetails[] }> = async () => {
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({
    include: { brand: true, category: true },
  });
  const serializableProducts = products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
  }));

  return { props: { products: serializableProducts }, revalidate: 60 };
};

function HomePage({ products }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Nossos Produtos</h1>
        <p className="text-xl text-gray-600 mt-2">
          Manutenção de Impressoras e Remanufatura de Cartuchos e Toners
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            {/* O "justify-between" foi adicionado para empurrar o texto para baixo */}
            <div className="border rounded-lg p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full flex flex-col justify-between items-center text-center">
              
              {/* Adicionamos a imagem do produto */}
              {product.imageUrl && (
                <Image
                  src={product.imageUrl}
                  alt={`Imagem do produto ${product.name}`}
                  width={200}
                  height={200}
                  className="object-cover mb-4" // object-cover evita distorção da imagem
                />
              )}
              
              {/* Div para agrupar o texto */}
              <div>
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-sm text-gray-500 mt-2">{product.brand.name} / {product.category.name}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export default HomePage;