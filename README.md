# Cap.Com Itaquaquecetuba - Catálogo Online

Este é o repositório oficial do catálogo online e site institucional da **Cap.Com Itaquaquecetuba**, uma loja especializada em soluções de impressão, incluindo cartuchos, toners, impressoras e serviços de manutenção.

O projeto é construído com **Next.js 15 (Turbopack)** e **Prisma**, utilizando **Geração de Site Estático Incremental (ISR)** para alta performance e **Renderização no Lado do Servidor (SSR)** para funcionalidades dinâmicas como a busca.

## ✨ Features Principais

O site serve tanto como um portfólio de serviços quanto um catálogo de produtos detalhado.

  * **Página Inicial (`index.tsx`):** Utiliza `getStaticProps` (ISR) para alta performance. Apresenta a loja com uma seção *Hero*, listagem de "Categorias" principais, "Nossos Serviços" (Remanufatura e Manutenção), "Sobre Nós" e "Localização" interativa (Google Maps e Waze).
  * **Catálogo de Produtos (ISR):** Páginas de produtos (`/produto/[slug]`) são geradas estaticamente para performance máxima e SEO. Elas incluem detalhes, descrição, imagem, marca, categoria e uma lista de impressoras compatíveis. As páginas são revalidadas periodicamente (`revalidate: 60`).
  * **Navegação por Categoria (ISR):** As páginas de categoria (`/categoria/[slug]`) são geradas dinamicamente usando `getStaticPaths` e `getStaticProps`, permitindo a navegação por categorias e subcategorias (ex: Toners -\> Toner HP).
  * **Páginas de Impressoras por Marca (ISR):** Uma nova seção (`/impressoras/[brand]`) lista todos os modelos de impressoras de uma determinada marca (HP, Brother, etc.) e os suprimentos compatíveis cadastrados para cada uma.
  * **Busca Inteligente (SSR):** A funcionalidade de busca (`/busca`) é renderizada no servidor (`getServerSideProps`) para resultados em tempo real. A busca é avançada: ela pesquisa não apenas por nome de produto/descrição, mas também por **modelos de impressora**, retornando os suprimentos compatíveis corretos.
  * **Schema Robusto (`schema.prisma`):** O núcleo do sistema é um schema Prisma que mapeia `Product` (cartuchos/toners) a modelos de `Printer` através da tabela de relação `PrinterCompatibility`.
  * **Design Responsivo (Tailwind):** Utiliza Tailwind CSS com um tema customizado (dark mode) definido em `tailwind.config.ts`.
  * **SEO Otimizado:** Cada página utiliza um componente `SEO` customizado (`src/components/Seo.tsx`) para injetar tags `<title>` e `<meta description>` dinâmicas.
  * **CI/CD (`ci.yml`):** Um workflow de GitHub Actions está configurado para rodar `lint`, `build` (com `prisma generate`) e `test` (com `vitest`) em cada push e pull request para a `main`.

## 🛠️ Stack de Tecnologias

  * **Framework:** [Next.js](https://nextjs.org/) (v15 com Turbopack)
  * **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
  * **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
  * **ORM / Banco de Dados:** [Prisma](https://www.prisma.io/)
  * **Banco de Dados (Produção):** [PostgreSQL](https://www.postgresql.org/) (conforme `migration.sql`)
  * **Testes:** [Vitest](https://vitest.dev/)
  * **CI/CD:** [GitHub Actions](https://github.com/features/actions)
  * **Linting:** [ESLint](https://eslint.org/)

## 🚀 Como Rodar Localmente

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

### 1\. Pré-requisitos

  * [Node.js](https://nodejs.org/) (v20 ou superior, conforme `ci.yml`)
  * [npm](https://www.npmjs.com/) (ou yarn/pnpm)
  * Um servidor PostgreSQL rodando (localmente ou em um serviço como [Neon](https://neon.tech/))

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
  * `npm run test`: Executa os testes com Vitest.
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
│   ├── components/         # Componentes React (Layout, Cards, SEO, etc.)
│   ├── lib/
│   │   └── utils.ts        # Funções utilitárias (ex: slugify)
│   ├── pages/
│   │   ├── api/            # Rotas de API (ex: /api/products/[id])
│   │   ├── categoria/
│   │   │   └── [slug].tsx  # Página de Categoria (ISR)
│   │   ├── impressoras/
│   │   │   └── [brand].tsx # Página de Impressoras por Marca (ISR)
│   │   ├── produto/
│   │   │   └── [slug].tsx  # Página de Produto (ISR)
│   │   ├── _app.tsx        # App global (Layout, Splash Screen)
│   │   ├── busca.tsx       # Página de Busca (SSR)
│   │   └── index.tsx       # Página Inicial (ISR)
│   └── globals.css         # Estilos globais do Tailwind
│
├── next.config.ts          # Configurações do Next.js
├── package.json            # Dependências e scripts
└── tailwind.config.ts      # Configuração do tema do Tailwind
```

## 🌐 Deploy na Vercel

Este projeto está pronto para o deploy na Vercel, pois já utiliza PostgreSQL.

1.  **Conectar Repositório:** Importe seu projeto Git na Vercel.

2.  **Configurar Variáveis de Ambiente:** No painel do seu projeto na Vercel, vá em "Settings" \> "Environment Variables" e adicione a `DATABASE_URL` do seu banco de dados (ex: Vercel Postgres, Neon, etc.).

3.  **Ajustar o Comando de Build:** Altere o "Build Command" nas configurações do projeto na Vercel para aplicar as migrações e popular o banco antes de construir o site:

    ```bash
    npx prisma migrate deploy && npx prisma db seed && npm run build
    ```

      * `prisma migrate deploy`: Aplica as migrações no banco de produção.
      * `prisma db seed`: Popula seu banco de produção com os dados do `seed.ts`.
      * `npm run build`: Constrói o site Next.js.
