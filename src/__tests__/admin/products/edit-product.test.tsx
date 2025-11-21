import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react'; 
import userEvent from '@testing-library/user-event';
import EditProduct from '@/pages/admin/products/[id]'; 
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

// --- MOCKS DE DEPENDÊNCIAS EXTERNAS ---
// 1. Mock do next/router (para useRouter e router.push)
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

// 2. Mock do next-auth (para getSession)
vi.mock('next-auth/react', () => ({
  getSession: vi.fn(), // Removido getSession da importação do arquivo de teste, mas mantido o mock
}));

// 3. Mock do fetch (para chamadas de API)
const fetchMock = vi.fn();
global.fetch = fetchMock;

// 4. Mock do toast
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
  name: 'Toner Teste (Original)',
  description: 'Descricao longa',
  price: 150.00,
  type: 'TONER',
  brandId: 1,
  categoryId: 2,
  imageUrl: '/img/toner.png',
  slug: 'toner-teste-original',
  createdAt: new Date().toISOString(),
};

const mockBrands = [{ id: 1, name: 'HP' }];
const mockCategories = [{ id: 2, name: 'Toners' }];

const mockProps = {
  product: mockProduct,
  brands: mockBrands,
  categories: mockCategories,
};


describe('Página Admin/Editar Produto', () => {
  const user = userEvent.setup();
  const pushMock = vi.fn();

  beforeEach(() => {
    // Reseta mocks
    vi.clearAllMocks();
    (useRouter as Mock).mockReturnValue({ push: pushMock, query: { id: '101' } });

    // Simula a confirmação para DELETE
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  // --- Teste 1: Atualização (PUT) com Sucesso ---
  it('deve chamar a API de PUT, mostrar sucesso e redirecionar na atualização', async () => {
    // 1. Configura a resposta da API (SUCESSO)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockProduct, name: 'Novo Nome' }),
    });

    render(<EditProduct {...mockProps} />);

    // 2. Simula alteração do campo (para disparar a atualização)
    const nameInput = screen.getByLabelText('Nome do Produto');
    await user.clear(nameInput);
    await user.type(nameInput, 'Novo Nome');

    // 3. Submete o formulário
    const updateButton = screen.getByText('Atualizar Produto');
    await user.click(updateButton);

    // 4. Verifica o fluxo (Chamada API, Toast, Redirecionamento)
    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/products/101',
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('"name":"Novo Nome"'),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Produto atualizado com sucesso!',
        expect.anything()
      );
      expect(pushMock).toHaveBeenCalledWith('/admin/products');
    });
  });

  // --- Teste 2: Exclusão (DELETE) com Sucesso ---
  it('deve chamar a API de DELETE, mostrar sucesso e redirecionar na exclusão', async () => {
    // 1. Configura a resposta da API (SUCESSO)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Produto removido' }),
    });

    render(<EditProduct {...mockProps} />);

    // 2. Clica no botão de Excluir
    const deleteButton = screen.getByText('Excluir');
    await user.click(deleteButton);

    // 3. Verifica o fluxo (Chamada API, Toast, Redirecionamento)
    await waitFor(() => {
      expect(toast.loading).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/products/101',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(toast.success).toHaveBeenCalledWith(
        'Produto excluído com sucesso!',
        expect.anything()
      );
      expect(pushMock).toHaveBeenCalledWith('/admin/products');
    });
  });

  // --- Teste 3: Atualização (PUT) com Falha ---
  it('deve mostrar erro do servidor e manter-se na página em caso de falha no PUT', async () => {
    // 1. Configura a resposta da API (FALHA)
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Nome de produto já existe.' }),
    });

    render(<EditProduct {...mockProps} />);

    // 2. Clica no botão de Atualizar
    const updateButton = screen.getByText('Atualizar Produto');
    await user.click(updateButton);

    // 3. Verifica o fluxo (Toast e estado da página)
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Nome de produto já existe.',
        expect.anything()
      );
      expect(pushMock).not.toHaveBeenCalled();
      expect(screen.getByText('Nome de produto já existe.')).toBeInTheDocument(); // Verifica erro visível
      expect(screen.getByText('Atualizar Produto')).not.toBeDisabled(); // Não deve estar carregando
    });
  });
});
