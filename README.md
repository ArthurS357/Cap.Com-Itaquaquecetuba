# Cap.Com Itaquaquecetuba - Catálogo Online

[](https://www.google.com/search?q=https://github.com/arthurs357/cap.com-itaquaquecetuba/actions/workflows/ci.yml)

Este é o repositório oficial do catálogo online e site institucional da **Cap.Com Itaquaquecetuba**, uma loja especializada em soluções de impressão, incluindo cartuchos, toners, impressoras e serviços de manutenção.

O projeto é construído com **Next.js 15 (Turbopack)** e **Prisma**, utilizando **Geração de Site Estático Incremental (ISR)** para alta performance e **Renderização no Lado do Servidor (SSR)** para funcionalidades dinâmicas como a busca.

## ✨ Features Principais

O site serve tanto como um portfólio de serviços quanto um catálogo de produtos detalhado.

  * **Página Inicial (ISR):** Apresenta a loja com seções de "Categorias", "Nossos Serviços" (Remanufatura e Manutenção), "Sobre Nós" e "Localização" interativa.
  * **Catálogo de Produtos (ISR):** Páginas de produtos (`/produto/[slug]`) geradas estaticamente para performance máxima e SEO.tsx]. As páginas são revalidadas periodicamente (`revalidate: 60`).
  * **Navegação por Categoria (ISR):** As páginas (`/categoria/[slug]`) são geradas dinamicamente usando `getStaticPaths` e `getStaticProps`, permitindo a navegação por categorias e subcategorias.tsx].
  * **Busca Inteligente (SSR):** A funcionalidade de busca (`/busca`) é renderizada no servidor (`getServerSideProps`) para resultados em tempo real. A busca é avançada: ela pesquisa nomes de produtos e também **modelos de impressora**, retornando os suprimentos compatíveis.
  * **Schema Robusto (`schema.prisma`):** O núcleo do sistema é um schema Prisma que mapeia `Product` (cartuchos/toners) a modelos de `Printer` através da tabela de relação `PrinterCompatibility`.
  * **Testes Automatizados:** O projeto é coberto por testes de unidade e de componentes usando **Vitest** e **React Testing Library**.
  * **Integração Contínua (CI):** Um workflow de GitHub Actions roda `lint`, `build` e `test` em cada push e pull request para a `main`, garantindo a qualidade do código.
  * **Design Responsivo (Tailwind):** Utiliza Tailwind CSS com um tema customizado (dark mode) definido em `tailwind.config.ts`.
  * **SEO Otimizado:** Cada página utiliza um componente `SEO` customizado (`src/components/Seo.tsx`) para injetar tags `<title>` e `<meta description>` dinâmicas.

## 🛠️ Stack de Tecnologias

  * **Framework:** [Next.js](https://nextjs.org/) (v15 com Turbopack)
  * **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
  * **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
  * **ORM / Banco de Dados:** [Prisma](https://www.prisma.io/)
  * **Banco de Dados (Produção):** [PostgreSQL](https://www.postgresql.org/)
  * **Testes:** [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
  * **CI/CD:** [GitHub Actions](https://github.com/features/actions)
  * **Linting:** [ESLint](https://eslint.org/)

## 🚀 Como Rodar Localmente

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

### 1\. Pré-requisitos

  * [Node.js](https://nodejs.org/) (v20 ou superior, conforme `ci.yml`)
  * [npm](https://www.npmjs.com/) (ou yarn/pnpm)
  * Um servidor **PostgreSQL** rodando (localmente ou em um serviço como [Neon](https://neon.tech/))

### 2\. Clonar o Repositório

```bash
git clone https://github.com/arthurs357/cap.com-itaquaquecetuba.git
cd cap.com-itaquaquecetuba
```

### 3\. Instalar Dependências

```bash
npm install
```

### 4\. Configurar o Banco de Dados (Prisma)

**a. Criar arquivo `.env`:**
Crie um arquivo `.env` na raiz do projeto e adicione sua string de conexão do PostgreSQL:

```env
# Exemplo de .env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/DATABASE"
```

**b. Aplicar Migrações:**
Isso aplicará o schema do `prisma/schema.prisma` ao seu banco de dados PostgreSQL.

```bash
npx prisma migrate dev
```

**c. Popular o Banco de Dados (Seed):**
O projeto inclui um script (`prisma/seed.ts`) para popular o banco com categorias, marcas, produtos e impressoras.

```bash
npm run prisma:seed
```

### 5\. Rodar o Servidor de Desenvolvimento

Agora você pode iniciar o servidor de desenvolvimento (com Turbopack).

```bash
npm run dev
```

Abra [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) no seu navegador para ver o projeto funcionando.

## 📦 Scripts Disponíveis

  * `npm run dev`: Inicia o servidor de desenvolvimento com Turbopack.
  * `npm run build`: Gera a build de produção otimizada.
  * `npm run start`: Inicia a build de produção.
  * `npm run lint`: Executa o ESLint para análise de código.
  * `npm run test`: Executa a suíte de testes com Vitest e gera o relatório de cobertura.
  * `npm run prisma:seed`: Executa o script `prisma/seed.ts` para popular o banco de dados.

## 📂 Estrutura do Projeto (Simplificada)

```
.
├── .github/workflows/
│   └── ci.yml              # Workflow de Integração Contínua
├── prisma/
│   ├── migrations/         # Migrações do PostgreSQL
│   ├── schema.prisma       # Definição do schema do banco
│   └── seed.ts             # Script para popular o banco
│
├── public/
│   ├── images/             # Imagens de produtos, categorias, etc.
│   └── ...
│
├── src/
│   ├── components/         # Componentes React (Layout, Cards, SEO)
│   │   └── ...
│   │   └── *.test.tsx      # Testes de componentes
│   ├── lib/
│   │   ├── utils.ts        # Funções utilitárias
│   │   └── utils.test.ts   # Testes de utilitários
│   ├── pages/
│   │   ├── api/            # Rotas de API
│   │   ├── categoria/
│   │   │   └── [slug].tsx  # Página de Categoria (ISR)
│   │   ├── produto/
│   │   │   └── [slug].tsx  # Página de Produto (ISR)
│   │   ├── _app.tsx        # App global (Layout, Splash Screen)
│   │   ├── busca.tsx       # Página de Busca (SSR)
│   │   └── index.tsx       # Página Inicial (ISR)
│   └── globals.css         # Estilos globais do Tailwind
│
├── package.json            # Dependências e scripts
├── tailwind.config.ts      # Configuração do tema do Tailwind
├── vitest.config.ts        # Configuração do Vitest
└── vitest.setup.ts         # Setup global dos testes (jest-dom)
```

## 🌐 Deploy na Vercel

Este projeto está pronto para o deploy na Vercel (ou plataformas similares), pois já utiliza PostgreSQL.

1.  **Conectar Repositório:** Importe seu projeto Git na Vercel.

2.  **Configurar Variáveis de Ambiente:** No painel do seu projeto na Vercel, vá em "Settings" \> "Environment Variables" e adicione a `DATABASE_URL` do seu banco de dados de produção (ex: Vercel Postgres, Neon, etc.).

3.  **Ajustar o Comando de Build:** Altere o "Build Command" nas configurações do projeto na Vercel para aplicar as migrações e (opcionalmente) popular o banco antes de construir o site:

    ```bash
    npx prisma migrate deploy && npx prisma db seed && npm run build
    ```

      * `prisma migrate deploy`: Aplica as migrações no banco de produção.
      * `prisma db seed`: (Opcional) Popula seu banco de produção com os dados do `seed.ts`.
      * `npm run build`: Constrói o site Next.js.
