import { describe, it, expect } from 'vitest';
import { slugify } from './utils'; 

// 'describe' agrupa testes relacionados
describe('Função slugify', () => {

  // 'it' define um caso de teste específico
  it('deve converter espaços em hífens e tudo para minúsculas', () => {
    const input = 'Toner HP 85A';
    const expected = 'toner-hp-85a';
    
    // 'expect' verifica se o resultado é o esperado
    expect(slugify(input)).toBe(expected);
  });

  it('deve remover caracteres especiais', () => {
    const input = 'Cartuchos & Toners (Novo)';
    const expected = 'cartuchos-toners-novo';
    expect(slugify(input)).toBe(expected);
  });

  it('deve lidar com strings vazias', () => {
    const input = '';
    const expected = '';
    expect(slugify(input)).toBe(expected);
  });
});