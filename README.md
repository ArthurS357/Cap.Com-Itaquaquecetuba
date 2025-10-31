-----

# Cap.Com Itaquaquecetuba - Catálogo Online

Este é o repositório oficial do catálogo online e site institucional da **Cap.Com Itaquaquecetuba**, uma loja especializada em soluções de impressão, incluindo cartuchos, toners, impressoras e serviços de manutenção.

O projeto é construído com **Next.js** e **Prisma**, utilizando **Geração de Site Estático Incremental (ISR)** para alta performance e **Renderização no Lado do Servidor (SSR)** para funcionalidades dinâmicas como a busca.

## ✨ Features Principais

O site serve tanto como um portfólio de serviços quanto um catálogo de produtos detalhado.

  * **Página Inicial Completa:** Apresenta a loja com seções de "Categorias", "Nossos Serviços" (Remanufatura e Manutenção), "Sobre Nós" e "Localização" interativa (Google Maps e Waze).
  * **Catálogo de Produtos (ISR):** Páginas de produtos geradas estaticamente para performance máxima e SEO. As páginas são revalidadas periodicamente para buscar atualizações sem a necessidade de um novo deploy (`revalidate: 60`).tsx].
  * **Navegação por Categoria (ISR):** As páginas de categoria (`/categoria/[slug]`) e subcategoria são geradas dinamicamente usando `getStaticPaths` e `getStaticProps`, garantindo que o site seja rápido e escalável.tsx].
  * **Busca Inteligente (SSR):** A funcionalidade de busca (`/busca`) é renderizada no servidor (`getServerSideProps`) para resultados em tempo real. A busca é avançada: ela pesquisa não apenas nomes de produtos, mas também **modelos de impressora**, retornando os suprimentos compatíveis.
  * **Compatibilidade de Impressoras:** O núcleo do sistema é um schema Prisma robusto que mapeia produtos (cartuchos/toners) a modelos de impressora específicos através da tabela `PrinterCompatibility`.
  * **Design Responsivo com Tema Dark:** Utiliza Tailwind CSS com um tema customizado (dark mode) definido em `tailwind.config.ts`.
  * **SEO Otimizado:** Cada página utiliza um componente `SEO` customizado (`src/components/Seo.tsx`) para injetar tags `<title>` e `<meta description>` dinâmicas.

## 🛠️ Stack de Tecnologias

Este projeto utiliza um conjunto de tecnologias modernas para alta performance e excelente experiência de desenvolvimento.

  * **Framework:** [Next.js](https://nextjs.org/) (usando --turbopack)
  * **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
  * **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
  * **ORM / Banco de Dados:** [Prisma](https://www.prisma.io/)
  * **Dependências Principais:** [React](https://reactjs.org/), [React Icons](https://react-icons.github.io/react-icons/)
  * **Linting/Formato:** [ESLint](https://eslint.org/)

## 🚀 Como Rodar Localmente

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

### 1\. Pré-requisitos

  * [Node.js](https://nodejs.org/) (v18.18 ou superior)
  * [npm](https://www.npmjs.com/) (ou yarn/pnpm)

### 2\. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/cap.com-itaquaquecetuba.git
cd cap.com-itaquaquecetuba
```

### 3\. Instalar Dependências

```bash
npm install
```

### 4\. Configurar o Banco de Dados (Prisma)

Este projeto usa Prisma para gerenciamento do banco de dados. O setup inicial utiliza SQLite para facilidade de desenvolvimento.

**a. Gerar o Cliente Prisma:**
O primeiro passo é gerar o cliente Prisma com base no schema.

```bash
npx prisma generate
```

**b. Aplicar Migrações:**
Isso criará o arquivo de banco de dados SQLite (`prisma/mydb.db`) e aplicará o schema das tabelas.

```bash
npx prisma migrate dev
```

**c. Popular o Banco de Dados (Seed):**
O projeto inclui um script de `seed` para popular o banco com categorias, marcas, produtos e impressoras. O `package.json` já tem um script configurado para isso.

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
  * `npm run prisma:seed`: Executa o script `prisma/seed.ts` para popular o banco de dados.

## 📂 Estrutura do Projeto (Simplificada)

```
.
├── prisma/
│   ├── migrations/         # Migrações do banco de dados
│   ├── mydb.db             # Banco de dados SQLite (desenvolvimento)
│   ├── schema.prisma       # Definição do schema do banco de dados
│   └── seed.ts             # Script para popular o banco
│
├── public/
│   ├── images/
│   └── ...                 # Arquivos estáticos e imagens
│
├── src/
│   ├── components/         # Componentes React reutilizáveis (Layout, Cards, SEO)
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

## 🌐 Deploy na Vercel (Importante)

Este projeto está pronto para o deploy na Vercel, mas requer **uma etapa crucial**:

O banco de dados de desenvolvimento é um arquivo **SQLite** (`prisma/mydb.db`). Este tipo de banco de dados **não funciona** em ambientes Serverless como a Vercel, pois o sistema de arquivos é efêmero (temporário).

**Para fazer o deploy, você DEVE migrar para um banco de dados hospedado.**

### Passos para o Deploy:

1.  **Criar um Banco de Dados:** Crie um banco de dados **PostgreSQL** em um serviço como [Vercel Postgres](https://www.google.com/search?q=https://vercel.com/postgres), [Neon](https://neon.tech/) ou [Supabase](https://supabase.com/).

2.  **Alterar o Schema:** Mude o provider no seu `prisma/schema.prisma`:

    ```prisma
    // prisma/schema.prisma
    datasource db {
      provider = "postgresql" // Mude de "sqlite" para "postgresql"
      url      = env("DATABASE_URL")
    }
    ```

3.  **Configurar Variáveis de Ambiente:** No painel do seu projeto na Vercel, vá em "Settings" \> "Environment Variables" e adicione a `DATABASE_URL` que você obteve do seu provedor de banco (ex: Vercel Postgres).

4.  **Ajustar o Comando de Build:** Altere o comando de build na Vercel para aplicar as migrações e (opcionalmente) popular o banco antes de construir o site:

    ```bash
    npx prisma migrate deploy && npx prisma db seed && npm run build
    ```

      * `prisma migrate deploy`: Aplica as migrações no banco de produção.
      * `prisma db seed`: (Opcional) Popula seu banco de produção com os dados do `seed.ts`.
      * `npm run build`: Constrói o site Next.js.

Feito isso, seu projeto funcionará perfeitamente na Vercel, aproveitando ao máximo o ISR, SSR e as Funções Serverless.
