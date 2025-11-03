import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

// 'describe' para o componente
describe('Componente ProductCard', () => {

    // Teste 1: Caminho feliz (produto válido)
    it('deve renderizar as informações do produto corretamente', () => {
        // 1. Prepara um "mock" (dados falsos) para o produto
        const mockProduct = {
            id: 1,
            name: 'Toner Teste 123',
            slug: 'toner-teste-123',
            imageUrl: '/fake-image.png',
            brand: {
                name: 'Marca Falsa',
            },
        };

        // 2. Renderiza o componente passando o mock
        render(<ProductCard product={mockProduct} />);

        // 3. Verifica se o nome e a marca estão na tela
        expect(screen.getByText('Toner Teste 123')).toBeInTheDocument();
        expect(screen.getByText('Marca Falsa')).toBeInTheDocument();
    });

    // Teste 2: Caminho triste (produto inválido)
    it('deve renderizar o estado de fallback se o produto for nulo', () => {
        // 1. Renderiza o componente com 'product' nulo
        render(<ProductCard product={null} />);

        // 2. Verifica se o texto de fallback é exibido
        expect(screen.getByText('Produto Inválido')).toBeInTheDocument();
        expect(screen.getByText('Marca Desconhecida')).toBeInTheDocument();
    });

    // Teste 3: Caminho triste (produto sem slug, mas com imagem)
  it('deve renderizar o fallback COM IMAGEM se o produto não tiver slug', () => {
    // 1. Prepara um mock de produto sem slug
    const mockProductNoSlug = {
      id: 2,
      name: 'Toner Sem Slug',
      slug: null, // <--- O gatilho para o fallback
      imageUrl: '/imagem-real.png', // <--- O gatilho para a cobertura
      brand: {
        name: 'Marca Sem Slug',
      },
    };

    // 2. Renderiza o componente
    render(<ProductCard product={mockProductNoSlug} />);

    // 3. Verifica se os nomes de fallback são usados
    // (O componente usa os nomes reais se o produto existir)
    expect(screen.getByText('Toner Sem Slug')).toBeInTheDocument();
    expect(screen.getByText('Marca Sem Slug')).toBeInTheDocument();

    // 4. VERIFICAÇÃO PRINCIPAL: 
    // Garante que a imagem foi renderizada (pelo alt text)
    expect(screen.getByAltText('Toner Sem Slug')).toBeInTheDocument();
  });

  // Teste 4: Produto válido, mas sem imagem
  it('deve renderizar o placeholder "Sem imagem" para um produto válido sem imageUrl', () => {
    // 1. Mock de produto válido, mas sem imagem
    const mockProductNoImage = {
      id: 3,
      name: 'Toner Sem Imagem',
      slug: 'toner-sem-imagem',
      imageUrl: null, // <--- O gatilho
      brand: {
        name: 'Marca Válida',
      },
    };

    // 2. Renderiza o componente
    render(<ProductCard product={mockProductNoImage} />);

    // 3. Verifica se o nome e marca estão corretos
    expect(screen.getByText('Toner Sem Imagem')).toBeInTheDocument();
    expect(screen.getByText('Marca Válida')).toBeInTheDocument();

    // 4. Verifica se o placeholder é exibido
    expect(screen.getByText('Sem imagem')).toBeInTheDocument();
  });

  // Teste 5: Produto de fallback sem marca
  it('deve renderizar o fallback corretamente se o produto não tiver marca', () => {
    // 1. Mock de produto sem marca (mas com slug)
    const mockProductNoBrand = {
      id: 4,
      name: 'Produto Sem Marca',
      slug: 'produto-sem-marca',
      imageUrl: null,
      brand: null, // <--- O gatilho
    };

    // 2. Renderiza o componente (forçando o tipo, pois a prop não aceita 'null')
    render(<ProductCard product={mockProductNoBrand as any} />);

    // 3. Verifica se os nomes de fallback são usados
    expect(screen.getByText('Produto Sem Marca')).toBeInTheDocument();
    expect(screen.getByText('Marca Desconhecida')).toBeInTheDocument();
  });
});