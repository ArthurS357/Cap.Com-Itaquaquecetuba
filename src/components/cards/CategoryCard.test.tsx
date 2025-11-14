import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryCard from './CategoryCard';
import type { Category } from '@prisma/client';
import { slugify } from '@/lib/utils';  

describe('Componente CategoryCard', () => {

  // Mock dos dados (props) que o componente espera
  const mockCategory: Category = {
    id: 1,
    name: 'Cartuchos e Toners',
    slug: 'cartuchos-e-toners', // Slug vindo do DB
    imageUrl: '/images/categorias/mock-image.png',
    parentId: null,
  };

  it('deve renderizar o nome e a imagem da categoria', () => {
    render(<CategoryCard category={mockCategory} />);

    expect(screen.getByText('Cartuchos e Toners')).toBeInTheDocument();

    const image = screen.getByAltText('Imagem para a categoria Cartuchos e Toners');
    expect(image).toBeInTheDocument();
    
    // O Next/Image formata o src, assim verefica se ele "contém" o path
    expect(image).toHaveAttribute('src', expect.stringContaining('mock-image.png'));
  });

  // O componente usa a função slugify(category.name) para gerar o link
  it('deve criar um link com o href correto (slugificado)', () => {
    render(<CategoryCard category={mockCategory} />);

    const expectedSlug = slugify(mockCategory.name);
    const expectedHref = `/categoria/${expectedSlug}`;

    // O componente renderiza um <Link> do Next, que vira <a> no HTML.
    const link = screen.getByRole('link');
    
    expect(link).toHaveAttribute('href', expectedHref);
  });

  it('deve renderizar sem a imagem se imageUrl for nulo', () => {
    const categoryNoImage = { ...mockCategory, imageUrl: null };
    render(<CategoryCard category={categoryNoImage} />);

    expect(screen.getByText('Cartuchos e Toners')).toBeInTheDocument();
    
    // queryBy... retorna null se não encontrar, em vez de falhar
    const image = screen.queryByAltText('Imagem para a categoria Cartuchos e Toners');
    expect(image).not.toBeInTheDocument();
  });
});