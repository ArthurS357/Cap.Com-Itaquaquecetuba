import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm from '@/components/admin/ProductForm';
import { Product } from '@prisma/client'; 
import React from 'react';

// --- MOCKS ---

// Mock react-hot-toast
vi.mock('react-hot-toast', () => {
  const mockFn = vi.fn();
  
  Object.assign(mockFn, {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  });

  return { 
    default: mockFn
  };
});

// Mock next/image
type ImageProps = { src: string; alt: string; [key: string]: unknown };
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: ImageProps) => <img {...props as React.ImgHTMLAttributes<HTMLImageElement>} data-testid="form-image" alt={props.alt as string} />,
}));

// Mock UploadButton
interface MockUploadButtonProps {
    onClientUploadComplete: (res: { url: string }[] | null) => void;
    [key: string]: unknown;
}
vi.mock('@/utils/uploadthing', () => ({
    UploadButton: (props: MockUploadButtonProps) => (
        <button data-testid="upload-button" onClick={() => props.onClientUploadComplete([{ url: 'mock.png' }])}>
            Upload
        </button>
    )
}));


// --- DADOS MOCKADOS ---
type PrinterModel = { id: number; modelName: string };
const mockPrinters: PrinterModel[] = [
    { id: 101, modelName: 'HP M1132' },
    { id: 102, modelName: 'Epson L3250' },
    { id: 103, modelName: 'Brother DCP-L2540DW' },
];
const mockInitialProduct: Product & { compatibleWith: { printerId: number }[] } = {
    id: 1,
    name: 'Toner Teste 85A',
    description: 'Descricao do produto',
    price: 150.00,
    type: 'TONER',
    brandId: 10,
    categoryId: 20,
    imageUrl: 'https://initial-image.png',
    slug: 'toner-teste-85a',
    createdAt: new Date(),
    updatedAt: new Date(),
    compatibleWith: [{ printerId: 101 }], 
};

const defaultProps = {
    title: 'Adicionar Produto',
    brands: [{ id: 10, name: 'HP', slug: 'hp' }],
    categories: [{ id: 20, name: 'Toners', slug: 'toners', imageUrl: null, parentId: null }],
    printers: mockPrinters,
    onSubmit: vi.fn(),
    isLoading: false,
};


describe('Componente ProductForm (Simplificado)', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks(); 
    });

    // TESTE 1: MODO CRIAÇÃO
    it('deve inicializar o formulário em modo de CRIAÇÃO', () => {
        render(<ProductForm {...defaultProps} />);

        expect(screen.getByRole('heading', { name: /Adicionar Produto/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Ex: Toner HP 85A')).toHaveValue('');
        expect(screen.queryByText(/Excluir/i)).not.toBeInTheDocument();
    });

    // TESTE 2: MODO EDIÇÃO
    it('deve inicializar o formulário em modo de EDIÇÃO e preencher campos', () => {
        const onDeleteMock = vi.fn();
        render(<ProductForm {...defaultProps} title="Editar Produto" initialData={mockInitialProduct} onDelete={onDeleteMock} />);

        expect(screen.getByRole('heading', { name: /Editar Produto/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Nome do Produto')).toHaveValue(mockInitialProduct.name);
        expect(screen.getByText('Excluir')).toBeInTheDocument();
    });
    
    // TESTE 3: SUBMISSÃO BÁSICA
    it('deve chamar onSubmit com os dados ao submeter', async () => {
        const onSubmitMock = vi.fn();
        render(<ProductForm {...defaultProps} onSubmit={onSubmitMock} />);

        await user.type(screen.getByLabelText('Nome do Produto'), 'Teste Rápido');
        await user.click(screen.getByText('Salvar Produto'));

        expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });

    // TESTE 4: REMOÇÃO DA IMAGEM
    it('deve remover a imagem quando o botão X do preview é clicado', async () => {
        render(<ProductForm {...defaultProps} initialData={mockInitialProduct} />);
        
        const removeBtn = screen.getByTitle('Remover imagem');
        
        await user.click(removeBtn);
        
        expect(screen.queryByTitle('Remover imagem')).not.toBeInTheDocument();
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    });
    
    // TESTE 5: FUNCIONALIDADE BÁSICA DO MULTI-SELECT
    it('deve permitir adicionar um item no multi-select', async () => {
        render(<ProductForm {...defaultProps} />);
        
        const searchInput = screen.getByPlaceholderText('Buscar modelo de impressora (ex: M1132)');
        
        await user.type(searchInput, 'Epson');
        const suggestion = screen.getByText('Epson L3250');
        await user.click(suggestion);
        
        expect(screen.getByText(/Epson L3250/i)).toBeInTheDocument();
    });
});
