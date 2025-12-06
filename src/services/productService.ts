import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type ProductSearchParams = {
    query?: string;
    brands?: string[];
    types?: string[];
    sort?: string; 
};

export const productService = {
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
        const { query = '', brands = [], types = [], sort = 'name_asc' } = params; // Default para A-Z

        // 1. Condição de Busca por Texto
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

        // 2. Cláusula WHERE final
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

        // 3. Definição da Ordenação 
        let orderBy: Prisma.ProductOrderByWithRelationInput = { name: 'asc' };
        
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'name_desc':
                orderBy = { name: 'desc' };
                break;
            case 'newest':
                orderBy = { createdAt: 'desc' };
                break;
            default:
                orderBy = { name: 'asc' };
        }

        // 4. Executa a busca
        const products = await prisma.product.findMany({
            where: whereClause,
            take: 100,
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
            orderBy: orderBy, 
        });

        return products;
    },
};
