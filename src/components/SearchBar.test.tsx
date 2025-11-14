import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from './SearchBar';
import { useRouter } from 'next/router';

// Mock do hook useRouter, já que o componente depende dele
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

// "Spy" para a função push
const mockRouterPush = vi.fn();

// Mock configuradp para retornar nossa função 'push' espiã
vi.mocked(useRouter).mockReturnValue({
  push: mockRouterPush,
} as any);


describe('Componente SearchBar', () => {
  const user = userEvent.setup();

  // Limpa os mocks após cada teste
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o input de busca com o placeholder correto', () => {
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
    
    await user.type(input, 'Epson L3250');
    await user.keyboard('{Enter}');
    
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/busca?q=Epson%20L3250');
  });

  it('não deve chamar router.push se a busca estiver vazia', async () => {
    render(<SearchBar />);
    
    const input = screen.getByPlaceholderText('Buscar por produto, marca ou impressora...');
    
    await user.click(input); // Foca no input
    await user.keyboard('{Enter}');
    
    expect(mockRouterPush).not.toHaveBeenCalled();
  });
});