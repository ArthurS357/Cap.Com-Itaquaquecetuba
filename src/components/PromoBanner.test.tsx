import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromoBanner from './PromoBanner';

// Mock do fetch global
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('Componente PromoBanner', () => {

  beforeEach(() => {
    fetchMock.mockClear();
  });

  // --- NOVO TESTE PARA COBRIR O .CATCH (Linha 17) ---
  it('deve retornar null e manter-se escondido se a API de config falhar (cobrindo o catch)', async () => {
    // Simula um erro de rede/fetch (rejeição da Promise)
    fetchMock.mockRejectedValue(new Error('Erro de rede simulado'));

    const { container } = render(<PromoBanner />);

    // Aguarda a rejeição do fetch ser processada
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    
    // O estado inicial do banner é { isActive: false }, o catch deve garantir que permaneça assim, 
    // resultando no retorno de 'null' e um container vazio.
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
