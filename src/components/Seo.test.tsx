import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import SEO from './Seo';
import React from 'react';

// --- MOCK DO NEXT/HEAD ---
// Ajustamos o mock para retornar uma <div>. Isso força o React a renderizar
// as tags <title> e <meta> dentro dela no DOM de teste, tornando-as "encontráveis".
vi.mock('next/head', () => {
  return {
    default: ({ children }: { children: React.ReactNode }) => {
      return <div data-testid="next-head-mock">{children}</div>;
    },
  };
});

describe('Componente SEO', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('deve usar a descrição padrão e NÃO renderizar a tag de imagem quando apenas o título é fornecido', () => {
    const { container } = render(<SEO title="Página Inicial" />);

    // Verifica se o mock funcionou
    expect(screen.getByTestId('next-head-mock')).toBeInTheDocument();

    // 1. Verifica Título Composto
    // O componente concatena: title + " | Cap.Com Itaquaquecetuba"
    const titleTag = container.querySelector('title');
    expect(titleTag).not.toBeNull();
    expect(titleTag).toHaveTextContent('Página Inicial | Cap.Com Itaquaquecetuba');

    // 2. Verifica Descrição Padrão (Fallback)
    const defaultDescText = 'Especialistas em manutenção de impressoras e remanufatura de cartuchos e toners em Itaquaquecetuba.';
    
    const metaDesc = container.querySelector('meta[name="description"]');
    expect(metaDesc).not.toBeNull();
    expect(metaDesc).toHaveAttribute('content', defaultDescText);

    const ogDesc = container.querySelector('meta[property="og:description"]');
    expect(ogDesc).toHaveAttribute('content', defaultDescText);

    // 3. Verifica que a tag og:image NÃO existe (Cobre o branch "false" da condicional de imagem)
    const ogImage = container.querySelector('meta[property="og:image"]');
    expect(ogImage).toBeNull();
  });

  it('deve usar a descrição personalizada e renderizar a tag de imagem quando fornecidos', () => {
    const customDesc = 'Esta é uma descrição personalizada para o produto.';
    const customImg = 'https://exemplo.com/imagem-produto.jpg';

    const { container } = render(
      <SEO 
        title="Produto X" 
        description={customDesc} 
        image={customImg} 
      />
    );

    // 1. Verifica Título
    const titleTag = container.querySelector('title');
    expect(titleTag).toHaveTextContent('Produto X | Cap.Com Itaquaquecetuba');

    // 2. Verifica Descrição Personalizada (Cobre o branch "true" do operador OU)
    const metaDesc = container.querySelector('meta[name="description"]');
    expect(metaDesc).toHaveAttribute('content', customDesc);

    // 3. Verifica que a tag og:image EXISTE e tem o link correto (Cobre o branch "true" da condicional de imagem)
    const ogImage = container.querySelector('meta[property="og:image"]');
    expect(ogImage).not.toBeNull();
    expect(ogImage).toHaveAttribute('content', customImg);
  });
});
