import { describe, it, expect, vi, beforeEach, waitFor } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductForm, { ProductFormData } from '@/components/admin/ProductForm';
import { Product, Brand, Category } from '@prisma/client';
import React from 'react';

// --- MOCKS DE FUNÇÕES DE TOAST (Definidas no topo para referências no describe) ---
// Definir como CONST permite que sejam usadas no escopo global e limpas no beforeEach.
const mockLoading = vi.fn(() => 'loading-id');
const mockSuccess = vi.fn();
const mockError = vi.fn();
const mockCustom = vi.fn(); 
const mockDismiss = vi.fn();

// Mock react-hot-toast: referencia os mocks criados acima no escopo
// Esta é a forma mais limpa e direta para contornar o hoisting.
vi.mock('react-hot-toast', () => {
  const toastFunction = (message: string, options?: unknown) => mockCustom(message, options);
  
  // O Object.assign garante que todas as propriedades sejam injetadas no export default.
  Object.assign(toastFunction, {
    loading: mockLoading,
    success: mockSuccess,
    error: mockError,
    dismiss: mockDismiss,
  });

  return { 
    default: toastFunction
  };
});

// --- MOCKS RESTANTES ---

// Interface para as props do mock da Imagem
type ImageProps = { src: string; alt: string; [key: string]: unknown };

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: ImageProps) => <img {...props as React.ImgHTMLAttributes<HTMLImageElement>} data-testid="form-image" alt={props.alt as string} />,
}));

// Interface para as props do mock do UploadButton
interface MockUploadButtonProps {
  onClientUploadComplete: (res: { url: string }[] | null) => void;
  onUploadError: (error: Error) => void;
  [key: string]: unknown;
}

// Mock UploadButton para simular o upload completo
vi.mock('@/utils/uploadthing', () => ({
    UploadButton: (props: MockUploadButtonProps) => (
        <button 
            data-testid="upload-button" 
            onClick={() => {
                // Simula a conclusão do upload com uma URL de teste
                props.onClientUploadComplete([{ url: 'https://new-image-uploaded.png' }]);
            }}
        >
            Upload
        </button>
    )
}));


// --- DADOS MOCKADOS ---
type PrinterModel = { id: number; modelName: string };
const mockBrands: Brand[] = [{ id: 10, name: 'HP', slug: 'hp' }];
const mockCategories: Category[] = [{ id: 20, name: 'Toners', slug: 'toners', imageUrl: null, parentId: null }];
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
    compatibleWith: [{ printerId: 102 }], // Epson L3250
};

const defaultProps = {
    title: 'Adicionar Produto',
    brands: mockBrands,
    categories: mockCategories,
    printers: mockPrinters,
    onSubmit: vi.fn(),
    isLoading: false,
};


describe('Componente ProductForm', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        // Limpa os mocks de toast
        mockLoading.mockClear();
        mockSuccess.mockClear();
        mockError.mockClear();
        mockCustom.mockClear();
        vi.clearAllMocks(); // Limpa outros mocks como onSubmit
    });

    // --- TESTES DE RENDERIZAÇÃO E INICIALIZAÇÃO ---

    it('deve inicializar o formulário em modo de CRIAÇÃO (sem initialData)', () => {
        render(<ProductForm {...defaultProps} />);

        // Título
        expect(screen.getByRole('heading', { name: /Adicionar Produto/i })).toBeInTheDocument();
        
        // Campos vazios/default
        expect(screen.getByPlaceholderText('Ex: Toner HP 85A')).toHaveValue('');
        expect(screen.getByDisplayValue('TONER')).toBeInTheDocument();
        
        // Botão de Excluir NÃO deve estar visível
        expect(screen.queryByText(/Excluir/i)).not.toBeInTheDocument();
        
        // Upload deve estar visível
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    });

    it('deve inicializar o formulário em modo de EDIÇÃO (com initialData)', () => {
        const onDeleteMock = vi.fn();
        render(<ProductForm {...defaultProps} title="Editar Produto" initialData={mockInitialProduct} onDelete={onDeleteMock} />);

        // Título
        expect(screen.getByRole('heading', { name: /Editar Produto/i })).toBeInTheDocument();
        
        // Campos preenchidos
        expect(screen.getByLabelText('Nome do Produto')).toHaveValue(mockInitialProduct.name);
        expect(screen.getByDisplayValue('150')).toBeInTheDocument(); // Price
        
        // Imagem Preview deve estar visível
        const imagePreview = screen.getByTestId('form-image');
        expect(imagePreview).toHaveAttribute('src', 'https://initial-image.png');
        
        // Botão de Excluir DEVE estar visível
        expect(screen.getByText('Excluir')).toBeInTheDocument();
    });

    // --- TESTES DE INTERAÇÃO DO FORMULÁRIO ---

    it('deve chamar onSubmit com os dados corretos ao submeter', async () => {
        const onSubmitMock = vi.fn();
        render(<ProductForm {...defaultProps} onSubmit={onSubmitMock} />);

        await user.type(screen.getByLabelText('Nome do Produto'), 'Novo Toner');
        await user.type(screen.getByLabelText('Preço (R$)'), '99.90');

        await user.click(screen.getByText('Salvar Produto'));

        // O onSubmit deve ser chamado com os dados formatados
        expect(onSubmitMock).toHaveBeenCalledTimes(1);
        const expectedData: ProductFormData = {
            name: 'Novo Toner',
            description: '',
            price: '99.90',
            type: 'TONER',
            brandId: 10,
            categoryId: 20,
            imageUrl: '',
            compatiblePrinterIds: [],
        };
        expect(onSubmitMock).toHaveBeenCalledWith(expectedData);
    });
    
    // --- TESTES DE UPLOAD/IMAGEM (Cobre as branches de imagem) ---
    
    it('deve atualizar o imageUrl no formData após um upload bem-sucedido', async () => {
        render(<ProductForm {...defaultProps} />);
        
        // Simula o clique no botão (mockado) que dispara onClientUploadComplete
        await user.click(screen.getByTestId('upload-button'));

        await waitFor(() => {
            // Verifica se a URL de mock foi aplicada
            expect(screen.getByTestId('form-image')).toHaveAttribute('src', 'https://new-image-uploaded.png');
        });
        
        // Verifica se o toast de sucesso foi chamado, usando mockSuccess
        expect(mockSuccess).toHaveBeenCalledWith('Upload de imagem concluído!', expect.anything());
    });
    
    it('deve remover a imagem quando o botão X do preview é clicado', async () => {
        render(<ProductForm {...defaultProps} initialData={mockInitialProduct} />);
        
        // Imagem está presente
        expect(screen.getByTestId('form-image')).toBeInTheDocument();
        
        // Clica no botão de remover (ícone FaTimes)
        const removeBtn = screen.getByTitle('Remover imagem');
        await user.click(removeBtn);
        
        // Verifica se o toast genérico foi chamado (toast('Imagem removida'))
        expect(mockCustom).toHaveBeenCalledWith('Imagem removida', { icon: '🗑️' });
        
        // Imagem Preview deve sumir e o botão de upload deve aparecer
        expect(screen.queryByTestId('form-image')).not.toBeInTheDocument();
        expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    });

    // --- TESTES DA LÓGICA DE EXCLUSÃO (Cobre as branches de onDelete) ---

    it('deve chamar onDelete quando o botão Excluir é clicado', async () => {
        const onDeleteMock = vi.fn();
        render(<ProductForm {...defaultProps} title="Editar Produto" initialData={mockInitialProduct} onDelete={onDeleteMock} />);

        await user.click(screen.getByText('Excluir'));

        expect(onDeleteMock).toHaveBeenCalledTimes(1);
    });
    
    // --- TESTES DO NOVO COMPONENTE PrinterMultiSelect (Cobre branches de seleção/busca) ---

    it('deve permitir buscar e adicionar uma impressora', async () => {
        render(<ProductForm {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Buscar modelo de impressora (ex: M1132)');
        
        // 1. Digitar o termo de busca
        await user.type(searchInput, 'Epson');

        // 2. Verifica se a sugestão aparece
        const suggestion = screen.getByText('Epson L3250');
        expect(suggestion).toBeInTheDocument();
        
        // 3. Clica na sugestão para adicionar
        await user.click(suggestion);
        
        // 4. Verifica se a impressora foi para a lista de selecionados
        const selectedChip = screen.getByText(/Epson L3250/i);
        expect(selectedChip).toBeInTheDocument();
        
        // 5. Verifica se o item sumiu da lista de sugestões
        expect(screen.queryByText('Epson L3250')).not.toBeInTheDocument();
    });

    it('deve permitir remover uma impressora da lista de selecionados', async () => {
        // Inicializa com uma impressora selecionada (id: 102 - Epson L3250)
        render(<ProductForm {...defaultProps} initialData={mockInitialProduct} />);
        
        // 1. Encontra o chip do modelo selecionado
        const selectedChip = screen.getByText(/Epson L3250/i);
        expect(selectedChip).toBeInTheDocument();

        // 2. Clica no chip para remover
        await user.click(selectedChip);
        
        // 3. O chip deve ter sumido
        expect(screen.queryByText(/Epson L3250/i)).not.toBeInTheDocument();
        
        // 4. O item deve reaparecer na lista de sugestões quando a busca é limpa
        const searchInput = screen.getByPlaceholderText('Buscar modelo de impressora (ex: M1132)');
        await user.clear(searchInput);

        expect(screen.getByText('Epson L3250')).toBeInTheDocument();
    });

    it('deve mostrar mensagem de "Nenhum modelo encontrado" se a busca não tiver resultados', async () => {
        render(<ProductForm {...defaultProps} />);

        const searchInput = screen.getByPlaceholderText('Buscar modelo de impressora (ex: M1132)');
        await user.type(searchInput, 'Inexistente');

        expect(screen.getByText('Nenhum modelo encontrado ou todos já selecionados.')).toBeInTheDocument();
    });

});
