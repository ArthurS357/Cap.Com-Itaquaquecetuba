## 🔗 Cap.Com Itaquaquecetuba - Catálogo Online

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="NextAuth">
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest">
</p>

<p align="center">
  Um catálogo online e site institucional completo para Cap.Com Itaquaquecetuba, com área administrativa para gestão de produtos.<br>
  A complete online catalog and institutional website for Cap.Com Itaquaquecetuba, featuring an admin dashboard for product management.
</p>

<p align="center">
  <strong><a href="https://cap-com-itaquaquecetuba.vercel.app/">Ver Demo</a></strong> / <strong><a href="https://cap-com-itaquaquecetuba.vercel.app/">View Demo</a></strong>
</p>

---
<br>
<details>
<summary><strong>🇧🇷 README em Português</strong></summary>
<br>
  
# 🇧🇷 Cap.Com Itaquaquecetuba - Catálogo Online

[![CI (Build, Lint & Test)](https://github.com/arthurs357/cap.com-itaquaquecetuba/actions/workflows/ci.yml/badge.svg)](https://github.com/arthurs357/cap.com-itaquaquecetuba/actions/workflows/ci.yml)

Este é o repositório oficial do catálogo online e site institucional da **Cap.Com Itaquaquecetuba**, uma loja especializada em soluções de impressão. O projeto evoluiu para incluir um **CMS (Sistema de Gerenciamento de Conteúdo)** completo.

O projeto utiliza **Next.js 15 (Turbopack)**, **React 19**, **Prisma** e **NextAuth.js**, combinando alta performance (ISR) com segurança e gerenciamento de dados em tempo real.

## ✨ Features Principais

### 🛒 Área Pública (Cliente)
* **Catálogo Otimizado (ISR):** Páginas de produtos (`/produto/[slug]`) e categorias geradas estaticamente para SEO e velocidade máxima.
* **Busca Inteligente (SSR):** Pesquisa em tempo real (`/busca`) que encontra produtos por nome, descrição e até por **modelos de impressora compatíveis**.
* **Filtros Dinâmicos:** Filtragem lateral por Marca e Tipo de produto na página de busca.
* **Páginas de Impressoras:** Listagem automática de suprimentos compatíveis ao acessar a página de um modelo de impressora específico (`/impressoras/[brand]`).
* **Institucional:** Páginas de serviços (Manutenção/Remanufatura), FAQ, Sobre Nós e Localização com mapas.
* **SEO & Acessibilidade:** Sitemap XML automático, metadados dinâmicos e suporte a Dark Mode.

### 🛡️ Área Administrativa (Restrita)
* **Autenticação Segura:** Login via **NextAuth.js** para proteger as rotas de administração.
* **Dashboard:** Visão geral e navegação rápida para gerentes.
* **Gestão de Produtos (CRUD):** Adicionar, editar e remover produtos com upload de imagens integrado.
* **Gestão de Categorias:** Criar e organizar a hierarquia de categorias da loja.
* **Configurações da Loja:** Controle dinâmico do Banner de Avisos/Promoções que aparece no topo do site.
* **Upload de Imagens:** Integração com **UploadThing** para hospedagem e gerenciamento de fotos dos produtos.

## 🛠️ Stack de Tecnologias

* **Core:** [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilo:** [Tailwind CSS](https://tailwindcss.com/) & [Next-Themes](https://github.com/pacocoursey/next-themes)
* **Banco de Dados:** [Prisma ORM](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/)
* **Validação:** [Zod](https://zod.dev/)
* **Auth:** [NextAuth.js](https://next-auth.js.org/)
* **Uploads:** [UploadThing](https://uploadthing.com/)
* **Testes:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
* **CI/CD:** [GitHub Actions](https://github.com/features/actions)

## 🚀 Configuração do Ambiente

Para rodar o projeto, você precisará configurar as variáveis de ambiente.

### 1. Variáveis (.env)
Crie um arquivo `.env` na raiz com as seguintes chaves:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@host:port/db_name"

# Autenticação (Gere um segredo com `openssl rand -base64 32`)
NEXTAUTH_SECRET="seu-segredo-super-seguro"
NEXTAUTH_URL="http://localhost:3000"

# Credenciais do Admin (Definidas no [...nextauth].ts)
ADMIN_USER="admin"
ADMIN_PASSWORD="sua-senha-admin"

# Upload de Imagens (Crie uma conta no UploadThing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="seu-app-id"
````

### 2\. Instalação e Execução

```bash
# Instalar dependências
npm install

# Gerar cliente Prisma e aplicar migrações
npx prisma generate
npx prisma migrate dev

# (Opcional) Popular banco com dados iniciais
npm run prisma:seed

# Rodar servidor de desenvolvimento
npm run dev
```

## 📂 Estrutura Atualizada

```
src/
├── components/       # UI Components (Cards, Layout, SEO, Admin UI)
├── lib/              # Utilitários (slugify, prisma singleton)
├── pages/
│   ├── admin/        # 🔒 Rotas Protegidas (Dashboard, CRUD)
│   ├── api/          # API Routes (Auth, Products, UploadThing)
│   ├── categoria/    # Páginas de Categoria
│   ├── produto/      # Páginas de Produto
│   ├── busca.tsx     # Página de Busca
│   └── ...
├── services/         # Camada de Serviços (Busca, Lógica de Negócio)
├── server/           # Configuração do UploadThing Server
└── utils/            # Configuração do UploadThing Client
```

</details>

<br>

<details>
<summary><strong>🇬🇧 README in English</strong></summary>
<br>
  
# 🇬🇧 Cap.Com Itaquaquecetuba - Online Catalog

[](https://github.com/arthurs357/cap.com-itaquaquecetuba/actions/workflows/ci.yml)

This is the official repository for the online catalog and institutional website of **Cap.Com Itaquaquecetuba**. The project has evolved into a full **CMS (Content Management System)** for printing solutions.

Built with **Next.js 15 (Turbopack)**, **React 19**, **Prisma**, and **NextAuth.js**, balancing high performance (ISR) with secure, dynamic data management.

## ✨ Key Features

### 🛒 Public Area (Client)

  * **Optimized Catalog (ISR):** Statically generated product (`/produto/[slug]`) and category pages for maximum SEO and speed.
  * **Smart Search (SSR):** Real-time search (`/busca`) that matches product names, descriptions, and **compatible printer models**.
  * **Dynamic Filters:** Sidebar filtering by Brand and Type on the search page.
  * **Printer Pages:** Automatic listing of compatible supplies when accessing a specific printer model page (`/impressoras/[brand]`).
  * **Institutional:** Services pages, FAQ, About Us, and Location with maps.
  * **SEO & Accessibility:** Automatic XML Sitemap, dynamic metadata, and Dark Mode support.

### 🛡️ Admin Area (Restricted)

  * **Secure Auth:** **NextAuth.js** login to protect administrative routes.
  * **Dashboard:** Overview and quick navigation for managers.
  * **Product Management (CRUD):** Add, edit, and delete products with integrated image uploads.
  * **Category Management:** Create and organize the store's category hierarchy.
  * **Store Settings:** Dynamic control of the Promo Banner displayed at the top of the site.
  * **Image Uploads:** Integration with **UploadThing** for hosting and managing product photos.

## 🛠️ Tech Stack

  * **Core:** [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
  * **Language:** [TypeScript](https://www.typescriptlang.org/)
  * **Style:** [Tailwind CSS](https://tailwindcss.com/) & [Next-Themes](https://github.com/pacocoursey/next-themes)
  * **Database:** [Prisma ORM](https://www.prisma.io/) & [PostgreSQL](https://www.postgresql.org/)
  * **Validation:** [Zod](https://zod.dev/)
  * **Auth:** [NextAuth.js](https://next-auth.js.org/)
  * **Uploads:** [UploadThing](https://uploadthing.com/)
  * **Testing:** [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/)
  * **CI/CD:** [GitHub Actions](https://github.com/features/actions)

## 🚀 Environment Setup

To run this project, you need to configure the environment variables.

### 1\. Variables (.env)

Create a `.env` file in the root with the following keys:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/db_name"

# Auth (Generate a secret with `openssl rand -base64 32`)
NEXTAUTH_SECRET="your-super-secure-secret"
NEXTAUTH_URL="http://localhost:3000"

# Admin Credentials (Defined in [...nextauth].ts)
ADMIN_USER="admin"
ADMIN_PASSWORD="your-admin-password"

# Upload of Images (Create an account on UploadThing)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="your-app-id"
```

### 2\. Install & Run

```bash
# Install dependencies
npm install

# Generate Prisma client and apply migrations
npx prisma generate
npx prisma migrate dev

# (Optional) Seed database with initial data
npm run prisma:seed

# Run development server
npm run dev
```

## 📂 Updated Structure

```
src/
├── components/       # UI Components (Cards, Layout, SEO, Admin UI)
├── lib/              # Utilities (slugify, prisma singleton)
├── pages/
│   ├── admin/        # 🔒 Protected Routes (Dashboard, CRUD)
│   ├── api/          # API Routes (Auth, Products, UploadThing)
│   ├── categoria/    # Category Pages
│   ├── produto/      # Product Pages
│   ├── busca.tsx     # Search Page
│   └── ...
├── services/         # Service Layer (Search, Business Logic)
├── server/           # UploadThing Server config
└── utils/            # UploadThing Client config
```

</details>

