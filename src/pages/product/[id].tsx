import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { PrismaClient, Product, Brand, Category } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

type ProductWithDetails = Product & {
    brand: Brand;
    category: Category;
};

type PageProps = {
    product: ProductWithDetails;
    similarProducts: ProductWithDetails[];
};

export const getStaticPaths: GetStaticPaths = async () => {
    const prisma = new PrismaClient();
    const products = await prisma.product.findMany({
        select: { id: true },
    });

    const paths = products.map((product) => ({
        params: { id: product.id.toString() },
    }));

    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
    const prisma = new PrismaClient();
    const id = parseInt(context.params?.id as string, 10);

    if (isNaN(id)) {
        return { notFound: true };
    }

    const product = await prisma.product.findUnique({
        where: { id },
        include: { brand: true, category: true },
    });

    if (!product) {
        return { notFound: true };
    }

    const similarProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            NOT: { id: product.id },
        },
        take: 4,
        include: { brand: true, category: true },
    });

    const serializableProduct = {
      ...product,
      createdAt: product.createdAt.toISOString(),
    };
  
    const serializableSimilarProducts = similarProducts.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    }));

    return {
        props: {
            product: serializableProduct,
            similarProducts: serializableSimilarProducts,
        },
        revalidate: 60,
    };
};

function ProductPage({ product, similarProducts }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      {/* Seção do Produto Principal */}
      <div className="bg-gray-100 p-8 rounded-lg shadow-md mb-12 flex flex-col md:flex-row items-center gap-8">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={`Imagem do produto ${product.name}`}
            width={300}
            height={300}
            className="object-cover rounded-md"
          />
        )}
        <div>
            <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-xl text-gray-600 mt-2"><strong>Marca:</strong> {product.brand.name}</p>
            <p className="text-xl text-gray-600"><strong>Categoria:</strong> {product.category.name}</p>
            <p className="mt-4 text-gray-700">{product.description || 'Descrição detalhada do produto em breve.'}</p>
        </div>
      </div>

      {/* Seção de Produtos Similares */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-center">Produtos Similares</h2>
        {similarProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {similarProducts.map((p) => (
                    <Link href={`/product/${p.id}`} key={p.id}>
                        <div className="border rounded-lg p-4 shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer h-full flex flex-col justify-center items-center text-center">
                            <h3 className="font-semibold text-lg">{p.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{p.brand.name}</p>
                        </div>
                    </Link>
                ))}
            </div>
        ) : (
            <p className="text-center text-gray-500">Nenhum produto similar encontrado.</p>
        )}
      </div>
    </>
  );
}

export default ProductPage;