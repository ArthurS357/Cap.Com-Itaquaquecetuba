import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromoBanner from './PromoBanner';

// Mock do fetch global
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Componente PromoBanner', () => {

  beforeEach(() => {
    fetchMock.mockClear();
  });

  // --- NOVO TESTE PARA COBRIR O CATCH (Linha 17) ---
  it('deve lidar com JSON inválido ou falha de parsing (cobrindo o catch)', async () => {
    // Simula uma resposta OK, mas com erro no parsing do JSON, forçando o catch
    fetchMock.mockResolvedValue({
      ok: true, // Simula que a resposta HTTP foi bem-sucedida (status 200-299)
      json: async () => {
        throw new Error('Simulated JSON parsing error'); // Mas o parsing falha
      },
    });

    const { container } = render(<PromoBanner />);

    // Aguarda a rejeição ser processada pelo catch do useEffect
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    
    // O catch deve garantir que o componente retorne null (container vazio)
    expect(container).toBeEmptyDOMElement();
  });
  // ----------------------------------------------------


  it('não deve renderizar nada se a API retornar inativo ou erro', async () => {
    // Simula resposta da API com isActive: false
    fetchMock.mockResolvedValue({
      json: async () => ({ value: 'Promoção', isActive: false }),
    });

    const { container } = render(<PromoBanner />);

    // Aguarda promises resolverem
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    // O container deve estar vazio
    expect(container).toBeEmptyDOMElement();
  });

  it('deve renderizar o texto se a API retornar ativo', async () => {
    // Simula resposta positiva
    fetchMock.mockResolvedValue({
      json: async () => ({ value: 'Frete Grátis Hoje!', isActive: true }),
    });

    render(<PromoBanner />);

    // Usa findByText que já espera (await) o elemento aparecer
    const bannerText = await screen.findByText('Frete Grátis Hoje!');
    expect(bannerText).toBeInTheDocument();
  });

  it('deve fechar o banner ao clicar no botão', async () => {
    fetchMock.mockResolvedValue({
      json: async () => ({ value: 'Banner Fechável', isActive: true }),
    });

    render(<PromoBanner />);

    // Espera aparecer
    const bannerText = await screen.findByText('Banner Fechável');
    expect(bannerText).toBeInTheDocument();

    // Encontra e clica no botão de fechar (ícone FaTimes)
    const closeButton = screen.getByLabelText('Fechar aviso');
    fireEvent.click(closeButton);

    // Verifica se sumiu
    expect(bannerText).not.toBeInTheDocument();
  });
});
