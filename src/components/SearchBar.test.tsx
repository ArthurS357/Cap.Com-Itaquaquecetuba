import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

// 1. Mockamos o módulo, mas deixamos a implementação vazia por enquanto
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('Componente SearchBar', () => {
  const user = userEvent.setup();
  // Criamos o espião aqui, onde é seguro
  const pushMock = vi.fn();

  // 2. Antes de cada teste, definimos o que o useRouter deve retornar
  beforeEach(() => {
    (useRouter as unknown as { mockReturnValue: (arg: any) => void }).mockReturnValue({
      push: pushMock,
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
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
    await user.type(input, 'Epson L3250');
    await user.keyboard('{Enter}');
    
    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/busca?q=Epson%20L3250');
  });

  it('não deve chamar router.push se a busca estiver vazia', async () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');
    
    // Apenas clica e pressiona Enter
    await user.click(input);
    await user.keyboard('{Enter}');
    
    expect(pushMock).not.toHaveBeenCalled();
  });
});