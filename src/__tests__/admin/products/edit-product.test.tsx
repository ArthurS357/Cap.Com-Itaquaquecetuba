import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditProduct, { getServerSideProps } from '@/pages/admin/products/[id]';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { prisma } from '@/lib/prisma';
import { Product, Brand, Category } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';

// --- MOCKS ---
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    product: { findUnique: vi.fn() },
    brand: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
    printer: { findMany: vi.fn() },
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
// ATUALIZAÇÃO AQUI: Adicionado isFeatured: false
const mockProduct = {
  id: 101,
  name: 'Toner Teste',
  description: 'Desc',
  price: 150.00,
  type: 'TONER',
  brandId: 1,
  categoryId: 2,
  imageUrl: '/img.png',
  slug: 'toner-teste',
  createdAt: new Date(),
  updatedAt: new Date(),
  isFeatured: false, // <--- CAMPO NOVO OBRIGATÓRIO
  compatibleWith: [],
};

const mockBrands: Brand[] = [{ id: 1, name: 'HP', slug: 'hp' }];
const mockCategories: Category[] = [{ id: 2, name: 'Toners', slug: 'toners', imageUrl: '', parentId: null }];
const mockPrinters = [{ id: 1, modelName: 'Impressora HP' }];

const defaultProps = {
  product: mockProduct,
  brands: mockBrands,
  categories: mockCategories,
  printers: mockPrinters,
};

describe('Página Admin/Editar Produto (Componente)', () => {
  const user = userEvent.setup();
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: pushMock, query: { id: '101' } });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  // --- TESTES DE ATUALIZAÇÃO (PUT) ---

  it('deve chamar a API de PUT e exibir toast de sucesso ao salvar (Happy Path)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<EditProduct {...defaultProps} />);

    // O botão agora vem do ProductForm e diz "Salvar Produto"
    const saveBtn = screen.getByText('Salvar Produto');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/101'),
        expect.objectContaining({ method: 'PUT' })
      );
      // Mensagem atualizada para "Produto atualizado!"
      expect(toast.success).toHaveBeenCalledWith('Produto atualizado!', expect.any(Object));
      expect(pushMock).toHaveBeenCalledWith('/admin/products');
    });
  });

  it('deve exibir erro se a API de PUT falhar (Error Path)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Erro de validação no servidor' })
    });

    render(<EditProduct {...defaultProps} />);

    // Botão "Salvar Produto"
    const saveBtn = screen.getByText('Salvar Produto');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro de validação no servidor', expect.any(Object));
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it('deve exibir erro genérico se a API de PUT lançar exceção', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Falha de rede'));

    render(<EditProduct {...defaultProps} />);

    // CORREÇÃO: Botão "Salvar Produto"
    const saveBtn = screen.getByText('Salvar Produto');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Falha de rede', expect.any(Object));
    });
  });

  // --- TESTES DE EXCLUSÃO (DELETE) ---

  it('deve chamar a API de DELETE e exibir toast de sucesso ao excluir (Happy Path)', async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<EditProduct {...defaultProps} />);

    const delBtn = screen.getByText('Excluir');
    await user.click(delBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/products/101'),
        expect.objectContaining({ method: 'DELETE' })
      );
      // Mensagem atualizada para "Produto excluído!"
      expect(toast.success).toHaveBeenCalledWith('Produto excluído!', expect.any(Object));
      expect(pushMock).toHaveBeenCalledWith('/admin/products');
    });
  });

  it('deve exibir erro se a API de DELETE falhar (Error Path)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Não foi possível excluir' })
    });

    render(<EditProduct {...defaultProps} />);

    const delBtn = screen.getByText('Excluir');
    await user.click(delBtn);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Não foi possível excluir', expect.any(Object));
      expect(pushMock).not.toHaveBeenCalled();
    });
  });

  it('NÃO deve deletar se o usuário cancelar a confirmação', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<EditProduct {...defaultProps} />);

    const delBtn = screen.getByText('Excluir');
    await user.click(delBtn);

    expect(fetchMock).not.toHaveBeenCalled();
  });

  // --- TESTE DE BRANCH (CAMPOS NULOS) ---
  it('deve inicializar o formulário corretamente quando campos opcionais são nulos', () => {
    const productWithNulls = {
      ...mockProduct,
      description: null,
      price: null,
      imageUrl: null,
      compatibleWith: []
    };

    render(
      <EditProduct
        {...defaultProps}
        // @ts-expect-error Forçando tipo com null para teste
        product={productWithNulls}
      />
    );

    expect(screen.getByLabelText('Descrição')).toHaveValue('');
    // Verifica se o componente de upload renderizou procurando o texto de suporte
    expect(screen.getByText(/Suporta: PNG, JPG/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Preço (R$)')).toHaveValue(null);
  });
});

// --- TESTES DO SERVIDOR (getServerSideProps) ---
describe('getServerSideProps (Server)', () => {
  const context = { params: { id: '101' } } as unknown as GetServerSidePropsContext;

  it('deve redirecionar para login se não houver sessão', async () => {
    (getSession as Mock).mockResolvedValue(null);

    const response = await getServerSideProps(context);

    expect(response).toEqual({
      redirect: { destination: '/api/auth/signin', permanent: false }
    });
  });

  it('deve retornar notFound se o produto não existir', async () => {
    (getSession as Mock).mockResolvedValue({ user: { name: 'Admin' } });

    // @ts-expect-error: Mockando retorno nulo
    prisma.product.findUnique.mockResolvedValue(null);
    // @ts-expect-error: Mockando array vazio
    prisma.brand.findMany.mockResolvedValue([]);
    // @ts-expect-error: Mockando array vazio
    prisma.category.findMany.mockResolvedValue([]);
    // @ts-expect-error: Mockando array vazio
    prisma.printer.findMany.mockResolvedValue([]);

    const response = await getServerSideProps(context);

    expect(response).toEqual({ notFound: true });
  });

  it('deve retornar os dados se o produto existir', async () => {
    (getSession as Mock).mockResolvedValue({ user: { name: 'Admin' } });

    // @ts-expect-error: Mockando retorno válido
    prisma.product.findUnique.mockResolvedValue(mockProduct);
    // @ts-expect-error: Mockando retorno válido
    prisma.brand.findMany.mockResolvedValue(mockBrands);
    // @ts-expect-error: Mockando retorno válido
    prisma.category.findMany.mockResolvedValue(mockCategories);
    // @ts-expect-error: Mockando retorno válido
    prisma.printer.findMany.mockResolvedValue(mockPrinters);

    const response = await getServerSideProps(context);

    expect(response).toHaveProperty('props');

    if ('props' in response) {
      const props = await Promise.resolve(response.props) as { product: Product };
      expect(props.product.id).toEqual(mockProduct.id);
    }
  });
});