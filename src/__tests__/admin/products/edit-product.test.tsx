import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditProduct, { getServerSideProps } from '@/pages/admin/products/[id]';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { prisma } from '@/lib/prisma';

// --- MOCKS ---
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

// Mock do Prisma (para getServerSideProps)
vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: { findUnique: vi.fn() },
    brand: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
  },
}));

const fetchMock = vi.fn();
global.fetch = fetchMock;

vi.mock('react-hot-toast', () => ({
  default: {
    loading: vi.fn(() => 'loading-id'),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// --- DADOS MOCKADOS ---
const mockProduct = {
  id: 101,
  name: 'Toner Teste',
  description: 'Desc',
  price: 150.00,
  type: 'TONER',
  brandId: 1,
  categoryId: 2,
  imageUrl: '/img.png',
};

const mockBrands = [{ id: 1, name: 'HP' }];
const mockCategories = [{ id: 2, name: 'Toners' }];

describe('Página Admin/Editar Produto', () => {
  const user = userEvent.setup();
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: pushMock, query: { id: '101' } });
    // Default: confirmação positiva
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  // ... (Testes anteriores de Componente mantidos abaixo) ...

  it('deve chamar a API de PUT ao salvar', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<EditProduct product={mockProduct as any} brands={mockBrands} categories={mockCategories} />);
    
    const saveBtn = screen.getByText('Atualizar Produto');
    await user.click(saveBtn);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/products/101'),
      expect.objectContaining({ method: 'PUT' })
    ));
  });

  it('deve chamar a API de DELETE ao excluir', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<EditProduct product={mockProduct as any} brands={mockBrands} categories={mockCategories} />);
    
    const delBtn = screen.getByText('Excluir');
    await user.click(delBtn);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/products/101'),
      expect.objectContaining({ method: 'DELETE' })
    ));
  });

  // --- NOVO: Teste do Cancelamento ---
  it('NÃO deve deletar se o usuário cancelar a confirmação', async () => {
    // Simula o usuário clicando em "Cancelar" no confirm
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<EditProduct product={mockProduct as any} brands={mockBrands} categories={mockCategories} />);
    
    const delBtn = screen.getByText('Excluir');
    await user.click(delBtn);

    // Fetch NÃO deve ser chamado
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// --- NOVO BLOCO: Testes do Servidor (getServerSideProps) ---
describe('getServerSideProps (Server)', () => {
  const context = { params: { id: '101' } } as any;

  it('deve redirecionar para login se não houver sessão', async () => {
    (getSession as Mock).mockResolvedValue(null);

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      redirect: { destination: '/api/auth/signin', permanent: false }
    });
  });

  it('deve retornar notFound se o produto não existir', async () => {
    (getSession as Mock).mockResolvedValue({ user: { name: 'Admin' } });
    // @ts-expect-error Mock do prisma
    prisma.product.findUnique.mockResolvedValue(null); 
    // @ts-expect-error
    prisma.brand.findMany.mockResolvedValue([]);
    // @ts-expect-error
    prisma.category.findMany.mockResolvedValue([]);

    const response = await getServerSideProps(context);

    expect(response).toEqual({ notFound: true });
  });

  it('deve retornar os dados se o produto existir', async () => {
    (getSession as Mock).mockResolvedValue({ user: { name: 'Admin' } });
    // @ts-expect-error Mock do prisma
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    // @ts-expect-error
    prisma.brand.findMany.mockResolvedValue(mockBrands);
    // @ts-expect-error
    prisma.category.findMany.mockResolvedValue(mockCategories);

    const response = await getServerSideProps(context);

    expect(response).toHaveProperty('props');
    // @ts-expect-error verificando props
    expect(response.props.product).toEqual(mockProduct);
  });
});
