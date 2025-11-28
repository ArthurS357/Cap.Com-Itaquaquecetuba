import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductCard, { type MinimalProduct } from './ProductCard';

// --- MOCK NECESSÁRIO ---
// Simula o hook useWishlist para que o FavoriteButton funcione isoladamente
vi.mock('@/context/WishlistContext', () => ({
  useWishlist: () => ({
    isInWishlist: vi.fn(() => false), // Retorna falso por padrão
    toggleWishlist: vi.fn(),
    removeFromWishlist: vi.fn(),
    items: [],
    wishlistCount: 0
  }),
}));

describe('Componente ProductCard', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar as informações do produto corretamente (caminho feliz)', () => {
    const mockProduct: MinimalProduct = {
      id: 1,
      name: 'Toner Teste 123',
      slug: 'toner-teste-123',
      imageUrl: '/fake-image.png',
      price: 150.00, // Adicionado campo obrigatório
      brand: {
        name: 'Marca Falsa',
      },
    };

    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Toner Teste 123')).toBeInTheDocument();
    expect(screen.getByText('Marca Falsa')).toBeInTheDocument();
    expect(screen.getByAltText('Toner Teste 123')).toBeInTheDocument();
  });

  it('deve renderizar o placeholder "Sem imagem" para um produto válido sem imageUrl', () => {
    const mockProductNoImage: MinimalProduct = {
      id: 3,
      name: 'Toner Sem Imagem',
      slug: 'toner-sem-imagem',
      imageUrl: null,
      price: 80.00, // Adicionado campo obrigatório
      brand: {
        name: 'Marca Válida',
      },
    };

    render(<ProductCard product={mockProductNoImage} />);

    expect(screen.getByText('Toner Sem Imagem')).toBeInTheDocument();
    expect(screen.getByText('Marca Válida')).toBeInTheDocument();
    expect(screen.getByText('Sem imagem')).toBeInTheDocument();
  });

  it('deve renderizar o estado de fallback se o produto for nulo', () => {
    const randomMock = vi.spyOn(Math, 'random').mockReturnValue(0.123);
    
    render(<ProductCard product={null} />);

    expect(screen.getByText('Produto Inválido')).toBeInTheDocument();
    expect(screen.getByText('Marca Desconhecida')).toBeInTheDocument();
    expect(screen.getByText('Sem imagem')).toBeInTheDocument(); 
    
    expect(randomMock).toHaveBeenCalledTimes(1); 
    
    randomMock.mockRestore();
  });

  it('deve renderizar o fallback (com imagem) se o produto não tiver slug', () => {
    const mockProductNoSlug: MinimalProduct = {
      id: 2,
      name: 'Toner Sem Slug',
      slug: null,
      imageUrl: '/imagem-real.png',
      price: 120.00, // Adicionado campo obrigatório
      brand: {
        name: 'Marca Sem Slug',
      },
    };

    render(<ProductCard product={mockProductNoSlug} />);

    expect(screen.getByText('Toner Sem Slug')).toBeInTheDocument();
    expect(screen.getByText('Marca Sem Slug')).toBeInTheDocument();
    expect(screen.getByAltText('Toner Sem Slug')).toBeInTheDocument(); 
  });

  it('deve renderizar o fallback (com "Marca Desconhecida") se o produto não tiver marca', () => {
    const mockProductNoBrand: MinimalProduct = {
      id: 4,
      name: 'Produto Sem Marca',
      slug: 'produto-sem-marca',
      imageUrl: null,
      price: 50.00, // Adicionado campo obrigatório
      brand: null,
    };

    render(<ProductCard product={mockProductNoBrand} />);

    expect(screen.getByText('Produto Sem Marca')).toBeInTheDocument();
    expect(screen.getByText('Marca Desconhecida')).toBeInTheDocument();
    expect(screen.getByText('Sem imagem')).toBeInTheDocument();
  });
});
