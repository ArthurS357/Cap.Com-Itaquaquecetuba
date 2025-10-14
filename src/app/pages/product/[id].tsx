// src/pages/product/[id].tsx
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { PrismaClient, Product, Brand, Category } from '@prisma/client';

type ProductWithDetails = Product & { brand: Brand; category: Category };
type PageProps = {
    product: ProductWithDetails;
    similarProducts: ProductWithDetails[];
};

export const getStaticPaths: GetStaticPaths = async () => {
    const prisma = new PrismaClient();
    const products = await prisma.product.findMany({ select: { id: true } });
    const paths = products.map((product) => ({
        params: { id: product.id.toString() },
    }));
    return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
    const prisma = new PrismaClient();
    const id = parseInt(context.params?.id as string, 10);

    // Lógica duplicada da API Route para gerar páginas estáticas
    const product = await prisma.product.findUnique({
        where: { id },
        include: { brand: true, category: true },
    });

    if (!product) return { notFound: true };

    const similarProducts = await prisma.product.findMany({
        where: {
            OR: [{ categoryId: product.categoryId }, { brandId: product.brandId }],
            NOT: { id },
        },
        take: 4,
        include: { brand: true, category: true },
    });

    return { props: { product, similarProducts }, revalidate: 60 };
};

function ProductPage({ product, similarProducts }: InferGetStaticPropsType<typeof getStaticProps>) {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-lg text-gray-700">{product.brand.name} - {product.category.name}</p>
            <p className="mt-4">{product.description || 'Descrição não disponível.'}</p>

            <hr className="my-8" />

            <h2 className="text-2xl font-bold mb-4">Produtos Similares</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {similarProducts.map(p => (
                     <div key={p.id} className="border rounded-lg p-4 shadow-md">
                        <h3 className="font-semibold">{p.name}</h3>
                        <p className="text-sm text-gray-500">{p.brand.name}</p>
                     </div>
                ))}
            </div>
        </div>
    )
}

export default ProductPage;