import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PromoBanner from './PromoBanner';

describe('Componente PromoBanner', () => {
  // Mock do fetch global
  const fetchMock = vi.fn();
  global.fetch = fetchMock;

  beforeEach(() => {
    fetchMock.mockClear();
  });

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
    // O botão tem aria-label="Fechar aviso" no código original
    const closeButton = screen.getByLabelText('Fechar aviso');
    fireEvent.click(closeButton);

    // Verifica se sumiu
    expect(bannerText).not.toBeInTheDocument();
  });
});
