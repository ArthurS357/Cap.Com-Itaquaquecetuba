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
    <main className="container mx-auto p-8">
      <header className="text-center mb-12 flex flex-col items-center">
        <Image
          src="/logo-capcom.png"
          alt="Logo da Cap.Com Itaquaquecetuba"
          width={150}
          height={150}
          priority
        />
        <h1 className="text-4xl font-bold mt-4">Cap.Com Itaquaquecetuba</h1>
        <p className="text-xl text-gray-600 mt-2">
          Manutenção de Impressoras e Remanufatura de Cartuchos e Toners
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <div className="border rounded-lg p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full flex flex-col justify-center items-center text-center">
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-2">{product.brand.name} / {product.category.name}</p>
            </div>
          </Link>
        ))}
      </div>

      <footer className="text-center mt-12 p-4 border-t">
        <p>Não encontrou o seu produto?</p>
        <p className="font-semibold">Entre em contato: (xx) xxxxx-xxxx</p>
      </footer>
    </main>
  );
}

export default HomePage;