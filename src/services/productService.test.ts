import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './productService';
import { prisma } from '@/lib/prisma';

// 1. Mocka o módulo prisma para não conectar no banco real
vi.mock('@/lib/prisma', () => ({
  prisma: {
    brand: {
      findMany: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe('productService', () => {
  // Limpa os mocks antes de cada teste para não haver interferência
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFilters', () => {
    it('deve retornar marcas e tipos formatados corretamente', async () => {
      // Configura o retorno simulado do banco
      const mockBrands = [{ id: 1, name: 'HP', slug: 'hp' }];
      const mockTypes = [{ type: 'TONER' }, { type: 'IMPRESSORA' }];

      // @ts-expect-error Mockando retorno incompleto do Prisma.
      prisma.brand.findMany.mockResolvedValue(mockBrands);
      // @ts-expect-error Mockando retorno incompleto do Prisma.
      prisma.product.findMany.mockResolvedValue(mockTypes);

      const result = await productService.getFilters();

      expect(result).toEqual({
        brands: [{ id: 1, name: 'HP' }],
        types: ['TONER', 'IMPRESSORA'],
      });

      // Verifica se o prisma foi chamado corretamente
      expect(prisma.brand.findMany).toHaveBeenCalledWith(expect.objectContaining({
        orderBy: { name: 'asc' },
      }));
    });
  });

  describe('search', () => {
    it('deve realizar uma busca simples apenas com query', async () => {
      const query = 'Toner';
      // @ts-expect-error Mockando retorno do Prisma.
      prisma.product.findMany.mockResolvedValue([]); 
      await productService.search({ query });

      // Verifica se o findMany foi chamado com a cláusula OR correta
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.any(Array), // Verifica se existe o array de OR
              }),
            ]),
          }),
        })
      );
    });

    it('deve aplicar filtros de marca e tipo corretamente', async () => {
      // @ts-expect-error Mockando retorno do Prisma.
      prisma.product.findMany.mockResolvedValue([]);
      await productService.search({
        query: '',
        brands: ['HP'],
        types: ['TONER'],
      });

      // Verifica se o findMany recebeu os filtros no AND
      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.anything(), // Query vazia
              { brand: { name: { in: ['HP'] } } },
              { type: { in: ['TONER'] } },
            ]),
          }),
        })
      );
    });
  });
});
