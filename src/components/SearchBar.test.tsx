import { describe, it, expect, vi, afterEach, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

// 1. Mockamos o módulo next/router
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('Componente SearchBar', () => {
  const user = userEvent.setup();
  const pushMock = vi.fn();

  beforeEach(() => {
    // 2. Usa (useRouter as Mock) para o TypeScript aceitar o mockReturnValue
    (useRouter as Mock).mockReturnValue({
      push: pushMock,
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
      isFallback: false,
      isReady: true,
      isLocaleDomain: false,
      isPreview: false,
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

    // Simula digitar e pressionar Enter
    await user.type(input, 'Epson L3250{Enter}');

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/busca?q=Epson%20L3250');
  });

  it('não deve chamar router.push se a busca estiver vazia', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');

    // Apenas foca e aperta Enter sem digitar
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(pushMock).not.toHaveBeenCalled();
  });
});