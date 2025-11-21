import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import SEO from './Seo';

// --- MOCK DO NEXT/HEAD ---
// O componente Head do Next.js move seus filhos para o <head> do documento real.
// Para testes unitários, mockamos ele para renderizar os filhos (tags meta, title)
// diretamente onde o componente é chamado. Isso facilita a busca com querySelector.
vi.mock('next/head', () => {
  return {
    default: ({ children }: { children: Array<React.ReactElement> }) => {
      return <>{children}</>;
    },
  };
});

describe('Componente SEO', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('deve usar a descrição padrão e NÃO renderizar a tag de imagem quando apenas o título é fornecido', () => {
    // Renderiza apenas com título (image e description undefined)
    const { container } = render(<SEO title="Página Inicial" />);

    // 1. Verifica Título Composto
    // O componente concatena: title + " | Cap.Com Itaquaquecetuba"
    const titleTag = container.querySelector('title');
    expect(titleTag).toHaveTextContent('Página Inicial | Cap.Com Itaquaquecetuba');

    // 2. Verifica Descrição Padrão (Fallback)
    const defaultDescText = 'Especialistas em manutenção de impressoras e remanufatura de cartuchos e toners em Itaquaquecetuba.';
    
    const metaDesc = container.querySelector('meta[name="description"]');
    expect(metaDesc).toHaveAttribute('content', defaultDescText);

    const ogDesc = container.querySelector('meta[property="og:description"]');
    expect(ogDesc).toHaveAttribute('content', defaultDescText);

    // 3. Verifica que a tag og:image NÃO existe (Branch coverage: image é false)
    const ogImage = container.querySelector('meta[property="og:image"]');
    expect(ogImage).toBeNull();
  });

  it('deve usar a descrição personalizada e renderizar a tag de imagem quando fornecidos', () => {
    const customDesc = 'Esta é uma descrição personalizada para o produto.';
    const customImg = 'https://exemplo.com/imagem-produto.jpg';

    // Renderiza com todas as props opcionais
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

    // 2. Verifica Descrição Personalizada (Branch coverage: description é true)
    const metaDesc = container.querySelector('meta[name="description"]');
    expect(metaDesc).toHaveAttribute('content', customDesc);

    // 3. Verifica que a tag og:image EXISTE e tem o link correto (Branch coverage: image é true)
    const ogImage = container.querySelector('meta[property="og:image"]');
    expect(ogImage).toBeInTheDocument();
    expect(ogImage).toHaveAttribute('content', customImg);
  });
});
