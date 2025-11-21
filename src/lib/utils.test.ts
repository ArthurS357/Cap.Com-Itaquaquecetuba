import { describe, it, expect } from 'vitest';
import { slugify, cn } from './utils';

describe('Função slugify', () => {
  it('deve converter espaços em hífens e tudo para minúsculas', () => {
    const input = 'Toner HP 85A';
    const expected = 'toner-hp-85a';
    expect(slugify(input)).toBe(expected);
  });

  it('deve remover caracteres especiais não permitidos', () => {
    const input = 'Cartuchos & Toners @ 2024';
    const expected = 'cartuchos-toners-2024';
    expect(slugify(input)).toBe(expected);
  });

  it('deve lidar corretamente com acentuação (pt-BR)', () => {
    const input = 'Manutenção e Promoção de Verão';
    const expected = 'manutencao-e-promocao-de-verao';
    expect(slugify(input)).toBe(expected);
  });

  it('deve lidar com cedilha e til', () => {
    const input = 'Ação e Reação';
    const expected = 'acao-e-reacao';
    expect(slugify(input)).toBe(expected);
  });

  it('deve lidar com strings vazias ou nulas', () => {
    expect(slugify('')).toBe('');
    // @ts-expect-error Testando comportamento defensivo com tipo inválido
    expect(slugify(null)).toBe('');
    // @ts-expect-error Testando comportamento defensivo com tipo inválido
    expect(slugify(undefined)).toBe('');
  });

  it('deve remover hífens extras no início ou fim', () => {
    const input = '---Teste de URL---';
    const expected = 'teste-de-url';
    expect(slugify(input)).toBe(expected);
  });
});

describe('Função cn (Classnames)', () => {
  it('deve mesclar classes simples', () => {
    const result = cn('bg-red-500', 'text-white');
    expect(result).toBe('bg-red-500 text-white');
  });

  it('deve resolver conflitos de classes do Tailwind (merge)', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });

  it('deve lidar com condicionais e valores falsy', () => {
    const isTrue = true;
    const isFalse = false;
    const result = cn(
      'base-class',
      isTrue && 'visible-class',
      isFalse && 'hidden-class',
      null,
      undefined
    );
    expect(result).toBe('base-class visible-class');
  });

  it('deve aceitar arrays de classes', () => {
    const result = cn(['flex', 'justify-center']);
    expect(result).toBe('flex justify-center');
  });
});