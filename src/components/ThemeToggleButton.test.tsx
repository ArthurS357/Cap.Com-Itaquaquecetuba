import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggleButton from './ThemeToggleButton';
import { useTheme } from 'next-themes';

// Mock do hook useTheme da biblioteca next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

const mockSetTheme = vi.fn();
const mockedUseTheme = vi.mocked(useTheme);

describe('Componente ThemeToggleButton', () => {
  const user = userEvent.setup();

  // Reseta os mocks e define um valor padrão (modo claro) antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      themes: ['light', 'dark', 'system'], 
    });
  });

  it('deve renderizar o ícone de Sol e o aria-label correto no modo claro', () => {
    render(<ThemeToggleButton />);

    // No modo claro, o botão permite "Ativar modo escuro"
    const button = screen.getByLabelText('Ativar modo escuro');
    expect(button).toBeInTheDocument();
    
    expect(screen.queryByLabelText('Ativar modo claro')).not.toBeInTheDocument();
  });

  it('deve renderizar o ícone de Lua e o aria-label correto no modo escuro', () => {
    // Sobrescreve o mock padrão para simular o modo escuro
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'], 
    });
    
    render(<ThemeToggleButton />);

    // No modo escuro, o botão permite "Ativar modo claro"
    const button = screen.getByLabelText('Ativar modo claro');
    expect(button).toBeInTheDocument();
    
    expect(screen.queryByLabelText('Ativar modo escuro')).not.toBeInTheDocument();
  });

  it('deve chamar setTheme("dark") ao clicar no modo claro', async () => {
    render(<ThemeToggleButton />);
    
    const button = screen.getByLabelText('Ativar modo escuro');
    await user.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('deve chamar setTheme("light") ao clicar no modo escuro', async () => {
    // Configura o estado inicial como modo escuro
    mockedUseTheme.mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
      resolvedTheme: 'dark',
      themes: ['light', 'dark', 'system'], 
    });
    
    render(<ThemeToggleButton />);
    
    const button = screen.getByLabelText('Ativar modo claro');
    await user.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledTimes(1);
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});