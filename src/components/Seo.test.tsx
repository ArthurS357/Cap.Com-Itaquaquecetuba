import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import SEO from './Seo';
import React from 'react';

// --- MOCK ROBUSTO DO NEXT/HEAD ---
vi.mock('next/head', async () => {
  // Importa o React real com tipagem para usar Children e isValidElement
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  
  return {
    // Define explicitamente o tipo de children como ReactNode em vez de any
    default: ({ children }: { children: ReactActual.ReactNode }) => {
      return (
        <div data-testid="next-head-mock">
          {ReactActual.Children.map(children, (child) => {
            // Se o filho for nulo ou indefinido, retorna null
            if (!child) return null;

            // Verifica se é um elemento React válido para acessar .type e .props com segurança
            if (ReactActual.isValidElement(child)) {
                // Se for tag <title>, transforma em div data-tag="title"
                if (child.type === 'title') {
                   // @ts-expect-error Acessando children de forma segura após validação
                   return <div data-tag="title">{child.props.children}</div>;
                }
                // Se for tag <meta>, transforma em div data-tag="meta" e repassa props
                if (child.type === 'meta') {
                   return <div data-tag="meta" {...child.props} />;
                }
            }
            
            // Retorna outros filhos normalmente
            return child;
          })}
        </div>
      );
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

    // 1. Verifica se o mock renderizou
    expect(screen.getByTestId('next-head-mock')).toBeInTheDocument();

    // 2. Verifica Título
    const titleEl = container.querySelector('[data-tag="title"]');
    expect(titleEl).not.toBeNull();
    expect(titleEl).toHaveTextContent('Página Inicial | Cap.Com Itaquaquecetuba');

    // 3. Verifica Descrição Padrão
    const defaultDescText = 'Especialistas em manutenção de impressoras e remanufatura de cartuchos e toners em Itaquaquecetuba.';
    
    const metaDesc = container.querySelector('[data-tag="meta"][name="description"]');
    expect(metaDesc).not.toBeNull();
    expect(metaDesc).toHaveAttribute('content', defaultDescText);

    // 4. Verifica que a tag og:image NÃO existe
    const ogImage = container.querySelector('[data-tag="meta"][property="og:image"]');
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
    const titleEl = container.querySelector('[data-tag="title"]');
    expect(titleEl).toHaveTextContent('Produto X | Cap.Com Itaquaquecetuba');

    // 2. Verifica Descrição Personalizada
    const metaDesc = container.querySelector('[data-tag="meta"][name="description"]');
    expect(metaDesc).toHaveAttribute('content', customDesc);

    // 3. Verifica que a tag og:image EXISTE e tem o link correto
    const ogImage = container.querySelector('[data-tag="meta"][property="og:image"]');
    expect(ogImage).not.toBeNull();
    expect(ogImage).toHaveAttribute('content', customImg);
  });
});
