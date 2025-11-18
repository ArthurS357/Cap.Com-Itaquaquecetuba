import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

// Mock do módulo
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('Componente SearchBar', () => {
  const user = userEvent.setup();
  const pushMock = vi.fn();

  beforeEach(() => {
    // Configura o mock antes de cada teste
    // vi.mocked ajuda o TypeScript a entender que useRouter é um mock
    vi.mocked(useRouter).mockReturnValue({
      push: pushMock,
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      basePath: '',
      events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
      isFallback: false,
      isReady: true,
      isLocaleDomain: false,
      isPreview: false,
      back: vi.fn(),
      beforePopState: vi.fn(),
      prefetch: vi.fn().mockResolvedValue(undefined),
      reload: vi.fn(),
      replace: vi.fn(),
      forward: vi.fn(),
    });
  });

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
    
    // DICA: Digitar e apertar Enter no mesmo comando costuma ser mais robusto
    await user.type(input, 'Epson L3250{Enter}');
    
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/busca?q=Epson%20L3250');
  });

  it('não deve chamar router.push se a busca estiver vazia', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');
    
    await user.click(input);
    await user.keyboard('{Enter}');
    
    expect(pushMock).not.toHaveBeenCalled();
  });
});