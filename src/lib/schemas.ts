import { z } from 'zod';

// --- PRODUTOS ---

export const productCreateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    description: z.string().optional(),
    price: z.preprocess(
        (val) => (val === '' ? null : val),
        z.coerce.number().nonnegative("O preço não pode ser negativo.").optional().nullable()
    ),
    type: z.string().min(1, "O tipo é obrigatório."),
    brandId: z.coerce.number().int().positive("Marca inválida."),
    categoryId: z.coerce.number().int().positive("Categoria inválida."),
    imageUrl: z.string().optional().or(z.literal('')),
    compatiblePrinterIds: z.array(z.coerce.number().int().positive()).optional(),
    isFeatured: z.boolean().optional(),
});

export const productUpdateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres.").optional(),
    description: z.string().optional(),
    price: z.preprocess(
        (val) => (val === '' ? null : val),
        z.coerce.number().nonnegative().optional().nullable()
    ),
    type: z.string().min(1).optional(),
    brandId: z.coerce.number().int().positive().optional(),
    categoryId: z.coerce.number().int().positive().optional(),
    imageUrl: z.string().optional().or(z.literal('')),
    compatiblePrinterIds: z.array(z.coerce.number().int().positive()).optional(),
    isFeatured: z.boolean().optional(),
});

// --- CATEGORIAS ---

export const categoryCreateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    imageUrl: z.string().url().optional().or(z.literal('')),
    parentId: z.preprocess(
        (val) => (val === '' ? null : val),
        z.coerce.number().int().positive().optional().nullable()
    ),
});

export const categoryUpdateSchema = z.object({
    name: z.string().min(3).optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    parentId: z.preprocess(
        (val) => (val === '' ? null : val),
        z.coerce.number().int().positive().optional().nullable()
    ),
});