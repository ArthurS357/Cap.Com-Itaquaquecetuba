# 🔗 Cap.Com Itaquaquecetuba - Catálogo Online

\<p align="center"\>
Um catálogo online e site institucional completo para Cap.Com Itaquaquecetuba, demonstrando as melhores práticas de desenvolvimento web moderno com Next.js 15 (Turbopack), React 19 e Prisma.<br>
A complete online catalog and institutional website for Cap.Com Itaquaquecetuba, demonstrating modern web development best practices with Next.js 15 (Turbopack), React 19, and Prisma.
\</p\>

\<p align="center"\>
\<img src="[https://img.shields.io/badge/Next.js-000000?style=for-the-badge\&logo=nextdotjs\&logoColor=white](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)" alt="Next.js"\>
\<img src="[https://img.shields.io/badge/React-19-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB](https://www.google.com/search?q=https://img.shields.io/badge/React-19-20232A%3Fstyle%3Dfor-the-badge%26logo%3Dreact%26logoColor%3D61DAFB)" alt="React 19"\>
\<img src="[https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)" alt="TypeScript"\>
\<img src="[https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge\&logo=prisma\&logoColor=white](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)" alt="Prisma"\>
\<img src="[https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge\&logo=postgresql\&logoColor=white](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)" alt="PostgreSQL"\>
\<img src="[https://img.shields.io/badge/Tailwind\_CSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)" alt="Tailwind CSS"\>
\</p\>

\<p align="center"\>
\<strong\>\<a href="[https://cap-com-itaquaquecetuba.vercel.app/](https://cap-com-itaquaquecetuba.vercel.app/)"\>Ver Demo (Ainda não disponível)\</a\>\</strong\>
\</p\>

-----

\<details\>
\<summary\>
\<img src="[https://img.shields.io/badge/-](https://img.shields.io/badge/-)🇧🇷%20README%20em%20Português-informational?style=flat\&logo=github\&logoColor=white" alt="Português"\>
\</summary\>

## 🇧🇷 Cap.Com Itaquaquecetuba - Catálogo Online

[](https://www.google.com/search?q=%5Bhttps://github.com/arthurs357/cap.com-itaquaquecetuba/actions/workflows/ci.yml%5D\(https://github.com/arthurs357/cap.com-itaquaquecetuba/actions/workflows/ci.yml\))

Este é o repositório oficial do catálogo online e site institucional da **Cap.Com Itaquaquecetuba**, uma loja especializada em soluções de impressão, incluindo cartuchos, toners, impressoras e serviços de manutenção.

O projeto é construído com **Next.js 15 (Turbopack)**, **React 19** e **Prisma**, utilizando **Geração de Site Estático Incremental (ISR)** para alta performance e **Renderização no Lado do Servidor (SSR)** para funcionalidades dinâmicas como a busca.

### ✨ Features Principais

O site serve tanto como um portfólio de serviços quanto um catálogo de produtos detalhado.

  * **Página Inicial (ISR):** Apresenta a loja com seções de "Categorias", "Nossos Serviços" (Remanufatura e Manutenção), "Sobre Nós" e "Localização" interativa. Gerada estaticamente com `getStaticProps` para carregamento instantâneo.
  * **Catálogo de Produtos (ISR):** Páginas de produtos (`/produto/[slug]`) geradas estaticamente para performance máxima e SEO. Elas exibem detalhes, imagens e uma lista de impressoras compatíveis. As páginas são revalidadas periodicamente (`revalidate: 60`).
  * **Navegação por Categoria (ISR):** As páginas (`/categoria/[slug]`) são geradas dinamicamente usando `getStaticPaths` e `getStaticProps`, permitindo a navegação por categorias e subcategorias (ex: Cartuchos \> Toner \> Toner HP).
  * **Páginas de Impressoras (ISR):** Uma seção dedicada (`/impressoras/[brand]`) que lista todas as impressoras de uma marca (HP, Brother, etc.) e os suprimentos compatíveis com cada modelo, facilitando a busca do usuário por seu equipamento.
  * **Busca Inteligente (SSR):** A funcionalidade de busca (`/busca`) é renderizada no servidor (`getServerSideProps`) para resultados em tempo real. A busca é avançada: ela pesquisa nomes de produtos e também **modelos de impressora**, retornando os suprimentos compatíveis (ex: buscar por "L3250" retorna a "Tinta Epson").
  * **Schema Robusto (`schema.prisma`):** O núcleo do sistema é um schema Prisma que mapeia `Product` (cartuchos/toners) a modelos de `Printer` através da tabela de relação `PrinterCompatibility`.
  * **Testes Automatizados:** O projeto é coberto por testes de unidade e de componentes usando **Vitest** e **React Testing Library** (configurados em `vitest.config.ts`).
  * **Integração Contínua (CI):** Um workflow de GitHub Actions (`.github/workflows/ci.yml`) roda `lint`, `build` e `test` em cada push e pull request para a `main`, garantindo a qualidade do código.
  * **Design Responsivo (Tailwind):** Utiliza Tailwind CSS com um tema customizado (dark mode) definido em `tailwind.config.ts` e `globals.css`.
  * **SEO Otimizado:** Cada página utiliza um componente `SEO` customizado (`src/components/Seo.tsx`) para injetar tags `<title>` e `<meta description>` dinâmicas.

### 🛠️ Stack de Tecnologias

  * **Framework:** [Next.js](https://nextjs.org/) (v15.5.5 c/ Turbopack) & [React](https://react.dev/) (v19)
  * **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
  * **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
  * **ORM / Banco de Dados:** [Prisma](https://www.prisma.io/)
  * **Banco de Dados (Produção):** [PostgreSQL](https://www.postgresql.org/)
  * **Testes:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
  * **CI/CD:** [GitHub Actions](https://github.com/features/actions)
  * **Linting:** [ESLint](https://eslint.org/) (com `eslint-config-next`)

### 🚀 Como Rodar Localmente

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

#### 1\. Pré-requisitos

  * [Node.js](https://nodejs.org/) (v20 ou superior, conforme `ci.yml`)
  * [npm](https://www.npmjs.com/) (ou yarn/pnpm)
  * Um servidor **PostgreSQL** rodando (localmente ou em um serviço como [Neon](https://neon.tech/))

#### 2\. Clonar o Repositório

```bash
git clone https://github.com/arthurs357/cap.com-itaquaquecetuba.git
cd cap.com-itaquaquecetuba
```

#### 3\. Instalar Dependências

```bash
npm install
```

#### 4\. Configurar o Banco de Dados (Prisma)

**a. Criar arquivo `.env`:**
Crie um arquivo `.env` na raiz do projeto e adicione sua string de conexão do PostgreSQL:

```env
# Exemplo de .env
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/DATABASE"
```

**b. Aplicar Migrações:**
Isso aplicará o schema do `prisma/schema.prisma` ao seu banco de dados.

```bash
npx prisma migrate dev
```

**c. Popular o Banco de Dados (Seed):**
O projeto inclui um script (`prisma/seed.ts`) para popular o banco com categorias, marcas, produtos e impressoras.

```bash
npm run prisma:seed
```

#### 5\. Rodar o Servidor de Desenvolvimento

Agora você pode iniciar o servidor de desenvolvimento (com Turbopack).

```bash
npm run dev
```

Abra [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) no seu navegador para ver o projeto funcionando.

### 📦 Scripts Disponíveis

  * `npm run dev`: Inicia o servidor de desenvolvimento com Turbopack.
  * `npm run build`: Gera a build de produção otimizada (com Turbopack).
  * `npm run start`: Inicia a build de produção.
  * `npm run lint`: Executa o ESLint para análise de código.
  * `npm run test`: Executa a suíte de testes com Vitest e gera o relatório de cobertura.
  * `npm run prisma:seed`: Executa o script `prisma/seed.ts` para popular o banco de dados.

### 📂 Estrutura do Projeto (Simplificada)

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
│   │   └── *.test.tsx      # Testes de componentes
│   ├── lib/
│   │   ├── utils.ts        # Funções utilitárias
│   │   └── utils.test.ts   # Testes de utilitários
│   ├── pages/
│   │   ├── api/            # Rotas de API
│   │   ├── categoria/
│   │   │   └── [slug].tsx  # Página de Categoria (ISR)
│   │   ├── impressoras/
│   │   │   └── [brand].tsx # Página de Impressoras por Marca (ISR)
│   │   ├── produto/
│   │   │   └── [slug].tsx  # Página de Produto (ISR)
│   │   ├── _app.tsx        # App global (Layout, ThemeProvider)
│   │   ├── busca.tsx       # Página de Busca (SSR)
│   │   └── index.tsx       # Página Inicial (ISR)
│   └── globals.css         # Estilos globais do Tailwind
│
├── package.json            # Dependências e scripts
├── tailwind.config.ts      # Configuração do tema do Tailwind
├── vitest.config.ts        # Configuração do Vitest
└── vitest.setup.ts         # Setup global dos testes (jest-dom)
```

### 🌐 Deploy na Vercel

Este projeto está pronto para o deploy na Vercel (ou plataformas similares).

1.  **Conectar Repositório:** Importe seu projeto Git na Vercel.

2.  **Configurar Variáveis de Ambiente:** No painel do seu projeto na Vercel, vá em "Settings" \> "Environment Variables" e adicione a `DATABASE_URL` do seu banco de dados de produção (ex: Vercel Postgres, Neon, etc.).

3.  **Ajustar o Comando de Build:** Altere o "Build Command" nas configurações do projeto na Vercel para aplicar as migrações e popular o banco antes de construir o site:

    ```bash
    npx prisma migrate deploy && npx prisma db seed && npm run build
    ```

      * `prisma migrate deploy`: Aplica as migrações no banco de produção.
      * `prisma db seed`: (Opcional) Popula seu banco de produção com os dados do `seed.ts`.
      * `npm run build`: Constrói o site Next.js.

\</details\>

\<details\>
\<summary\>
\<img src="[https://img.shields.io/badge/-](https://img.shields.io/badge/-)🇬🇧%20README%20in%20English-informational?style=flat\&logo=github\&logoColor=white" alt="English"\>
\</summary\>

## 🇬🇧 Cap.Com Itaquaquecetuba - Online Catalog

[](https://github.com/arthurs357/cap.com-itaquaquecetuba/actions/workflows/ci.yml)

This is the official repository for the online catalog and institutional website of **Cap.Com Itaquaquecetuba**, a store specializing in printing solutions, including cartridges, toners, printers, and maintenance services.

The project is built with **Next.js 15 (Turbopack)**, **React 19**, and **Prisma**, utilizing **Incremental Static Regeneration (ISR)** for high performance and **Server-Side Rendering (SSR)** for dynamic features like search.

### ✨ Key Features

The site serves as both a service portfolio and a detailed product catalog.

  * **Homepage (ISR):** Introduces the store with "Categories," "Our Services" (Remanufacturing and Maintenance), "About Us," and an interactive "Location" section. Statically generated with `getStaticProps` for instant loading.
  * **Product Catalog (ISR):** Product pages (`/produto/[slug]`) are statically generated for maximum performance and SEO. They display details, images, and a list of compatible printers. Pages are revalidated periodically (`revalidate: 60`).
  * **Category Navigation (ISR):** Pages (`/categoria/[slug]`) are dynamically generated using `getStaticPaths` and `getStaticProps`, allowing navigation through categories and subcategories (e.g., Cartridges \> Toner \> Toner HP).
  * **Printer Pages (ISR):** A dedicated section (`/impressoras/[brand]`) that lists all printers for a specific brand (HP, Brother, etc.) and the compatible supplies for each model.
  * **Smart Search (SSR):** The search functionality (`/busca`) is server-side rendered (`getServerSideProps`) for real-time results. The search is advanced: it queries product names and also **printer models**, returning compatible supplies (e.g., searching "L3250" returns "Epson Ink").
  * **Robust Schema (`schema.prisma`):** The system's core is a Prisma schema that maps `Product` (cartridges/toners) to `Printer` models via the `PrinterCompatibility` relation table.
  * **Automated Testing:** The project is covered by unit and component tests using **Vitest** and **React Testing Library** (configured in `vitest.config.ts`).
  * **Continuous Integration (CI):** A GitHub Actions workflow (`.github/workflows/ci.yml`) runs `lint`, `build`, and `test` on every push and pull request to `main`, ensuring code quality.
  * **Responsive Design (Tailwind):** Uses Tailwind CSS with a custom dark mode theme defined in `tailwind.config.ts` and `globals.css`.
  * **Optimized SEO:** Each page uses a custom `SEO` component (`src/components/Seo.tsx`) to inject dynamic `<title>` and `<meta description>` tags.

### 🛠️ Tech Stack

  * **Framework:** [Next.js](https://nextjs.org/) (v15.5.5 w/ Turbopack) & [React](https://react.dev/) (v19)
  * **Language:** [TypeScript](https://www.typescriptlang.org/)
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  * **ORM / DB:** [Prisma](https://www.prisma.io/)
  * **Database (Production):** [PostgreSQL](https://www.postgresql.org/)
  * **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
  * **CI/CD:** [GitHub Actions](https://github.com/features/actions)
  * **Linting:** [ESLint](https://eslint.org/) (with `eslint-config-next`)

### 🚀 Running Locally

Follow the steps below to set up and run the project in your development environment.

#### 1\. Prerequisites

  * [Node.js](https://nodejs.org/) (v20 or higher, as per `ci.yml`)
  * [npm](https://www.npmjs.com/) (or yarn/pnpm)
  * A running **PostgreSQL** server (locally or on a service like [Neon](https://neon.tech/))

#### 2\. Clone the Repository

```bash
git clone https://github.com/arthurs357/cap.com-itaquaquecetuba.git
cd cap.com-itaquaquecetuba
```

#### 3\. Install Dependencies

```bash
npm install
```

#### 4\. Configure the Database (Prisma)

**a. Create `.env` file:**
Create a `.env` file in the project root and add your PostgreSQL connection string:

```env
# Example .env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

**b. Apply Migrations:**
This will apply the schema from `prisma/schema.prisma` to your database.

```bash
npx prisma migrate dev
```

**c. Populate the Database (Seed):**
The project includes a script (`prisma/seed.ts`) to populate the database with categories, brands, products, and printers.

```bash
npm run prisma:seed
```

#### 5\. Run the Development Server

Now you can start the development server (with Turbopack).

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to see the project running.

### 📦 Available Scripts

  * `npm run dev`: Starts the development server with Turbopack.
  * `npm run build`: Generates the optimized production build (with Turbopack).
  * `npm run start`: Starts the production build.
  * `npm run lint`: Runs ESLint for code analysis.
  * `npm run test`: Runs the test suite with Vitest and generates a coverage report.
  * `npm run prisma:seed`: Executes the `prisma/seed.ts` script to populate the database.

### 📂 Project Structure (Simplified)

```
.
├── .github/workflows/
│   └── ci.yml              # Continuous Integration Workflow
├── prisma/
│   ├── migrations/         # PostgreSQL Migrations
│   ├── schema.prisma       # Database schema definition
│   └── seed.ts             # Database seeding script
│
├── public/
│   ├── images/             # Product images, categories, etc.
│   └── ...
│
├── src/
│   ├── components/         # React components (Layout, Cards, SEO)
│   │   └── *.test.tsx      # Component tests
│   ├── lib/
│   │   ├── utils.ts        # Utility functions
│   │   └── utils.test.ts   # Utility tests
│   ├── pages/
│   │   ├── api/            # API Routes
│   │   ├── categoria/
│   │   │   └── [slug].tsx  # Category Page (ISR)
│   │   ├── impressoras/
│   │   │   └── [brand].tsx # Printer by Brand Page (ISR)
│   │   ├── produto/
│   │   │   └── [slug].tsx  # Product Page (ISR)
│   │   ├── _app.tsx        # Global App (Layout, ThemeProvider)
│   │   ├── busca.tsx       # Search Page (SSR)
│   │   └── index.tsx       # Homepage (ISR)
│   └── globals.css         # Tailwind global styles
│
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind theme configuration
├── vitest.config.ts        # Vitest configuration
└── vitest.setup.ts         # Global test setup (jest-dom)
```

### 🌐 Deploy on Vercel

This project is ready for deployment on Vercel (or similar platforms).

1.  **Connect Repository:** Import your Git project into Vercel.

2.  **Configure Environment Variables:** In your Vercel project dashboard, go to "Settings" \> "Environment Variables" and add the `DATABASE_URL` for your production database (e.g., Vercel Postgres, Neon, etc.).

3.  **Adjust the Build Command:** Change the "Build Command" in Vercel's project settings to apply migrations and seed the database before building the site:

    ```bash
    npx prisma migrate deploy && npx prisma db seed && npm run build
    ```

      * `prisma migrate deploy`: Applies migrations to the production database.
      * `prisma db seed`: (Optional) Populates your production database with data from `seed.ts`.
      * `npm run build`: Builds the Next.js site.

\</details\>
