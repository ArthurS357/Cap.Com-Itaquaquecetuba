import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';

// 1. Usamos vi.hoisted para criar os mocks ANTES de tudo
// Isso garante que a função 'push' existe quando o vi.mock for executado
const mocks = vi.hoisted(() => {
  return {
    push: vi.fn(),
  };
});

// 2. Mock do next/router usando a referência segura 'mocks.push'
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mocks.push,
    // Propriedades adicionais para evitar erros de tipagem se necessário
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

describe('Componente SearchBar', () => {
  const user = userEvent.setup();

  // Limpa o histórico de chamadas após cada teste
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o input de busca', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');
    expect(input).toBeInTheDocument();
  });

  it('deve atualizar o valor do input quando o usuário digita', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');
    
    await user.type(input, 'Toner HP');
    
    expect(input).toHaveValue('Toner HP');
  });

  it('deve chamar router.push com a query correta ao enviar o formulário', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');
    
    // Simula a digitação e o Enter
    await user.type(input, 'Epson L3250');
    await user.keyboard('{Enter}');
    
    // Verifica se o mock foi chamado com a URL esperada
    expect(mocks.push).toHaveBeenCalledTimes(1);
    expect(mocks.push).toHaveBeenCalledWith('/busca?q=Epson%20L3250');
  });

  it('não deve chamar router.push se a busca estiver vazia', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');
    
    // Apenas foca e aperta Enter sem digitar
    await user.click(input);
    await user.keyboard('{Enter}');
    
    expect(mocks.push).not.toHaveBeenCalled();
  });
});