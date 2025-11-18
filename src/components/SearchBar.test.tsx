import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

// 1. Mockamos o módulo next/router, mas deixamos o useRouter como uma função vazia (spy)
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('Componente SearchBar', () => {
  const user = userEvent.setup();
  // Criamos a função espiã que vamos monitorar
  const pushMock = vi.fn();

  // 2. ANTES de cada teste, definimos o que o useRouter deve retornar
  beforeEach(() => {
    (useRouter as unknown as { mockReturnValue: (arg: any) => void }).mockReturnValue({
      push: pushMock,
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
    });
  });

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
    
    // 3. Verificamos se a nossa função espiã (pushMock) foi chamada corretamente
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