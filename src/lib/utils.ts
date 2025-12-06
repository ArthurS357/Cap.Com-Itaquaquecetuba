import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Função auxiliar para classes do Tailwind (padrão em projetos shadcn/ui, útil manter)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const slugify = (text: string) => {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Separa os acentos das letras base
    .replace(/[\u0300-\u036f]/g, '') // Remove os caracteres de acento
    .replace(/ç/g, 'c') // Garante tratamento específico para cedilha se necessário
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/[^\w-]+/g, '') // Remove tudo que não for letra, número ou hífen
    .replace(/--+/g, '-') // Remove hífens duplicados
    .replace(/^-+/, '') // Remove hífens do início
    .replace(/-+$/, ''); // Remove hífens do final
};

export const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};