import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type ProductSearchParams = {
    query?: string;
    brands?: string[];
    types?: string[];
};

export const productService = {
    /**
     * Busca todas as marcas e tipos disponíveis para os filtros
     */
    async getFilters() {
        const [brands, types] = await Promise.all([
            prisma.brand.findMany({
                orderBy: { name: 'asc' },
                select: { id: true, name: true },
            }),
            prisma.product.findMany({
                select: { type: true },
                distinct: ['type'],
                orderBy: { type: 'asc' },
            }),
        ]);

        return {
            brands: brands.map((b) => ({ id: b.id, name: b.name })),
            types: types.map((t) => t.type),
        };
    },


    async search(params: ProductSearchParams) {
        const { query = '', brands = [], types = [] } = params;

        // 1. Condição de Busca por Texto (Nome, Descrição, Marca, Impressora)
        // Utilizamos 'as const' no mode para evitar erro de tipagem do TypeScript
        const textSearchCondition: Prisma.ProductWhereInput = query.trim()
            ? {
                OR: [
                    { name: { contains: query, mode: 'insensitive' as const } },
                    { description: { contains: query, mode: 'insensitive' as const } },
                    { brand: { name: { contains: query, mode: 'insensitive' as const } } },
                    {
                        compatibleWith: {
                            some: {
                                printer: {
                                    modelName: { contains: query, mode: 'insensitive' as const },
                                },
                            },
                        },
                    },
                ],
            }
            : {};

        // 2. Cláusula WHERE final combinando texto e filtros
        const whereClause: Prisma.ProductWhereInput = {
            AND: [
                textSearchCondition,
                brands && brands.length > 0
                    ? {
                        brand: { name: { in: brands } },
                    }
                    : {},
                types && types.length > 0
                    ? {
                        type: { in: types },
                    }
                    : {},
            ],
        };

        // 3. Executa a busca
        const products = await prisma.product.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
                price: true,
                type: true,
                brand: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        return products;
    },
}; 