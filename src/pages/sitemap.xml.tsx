import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';

// URL base do seu site (configure isso no .env para flexibilidade ou mantenha hardcoded se preferir)
const BASE_URL = 'https://cap-com-itaquaquecetuba.vercel.app';

// Função auxiliar para formatar a data no padrão W3C (YYYY-MM-DD)
const formatDate = (date: Date) => date.toISOString().split('T')[0];

function generateSiteMap(
  products: { slug: string; updatedAt?: Date }[],
  categories: { slug: string }[],
  brands: { slug: string }[],
  printers: { modelName: string }[]
) {
  // Rotas estáticas que sempre existem
  const staticPages = [
    `${BASE_URL}/`,
    `${BASE_URL}/servicos/manutencao`,
    `${BASE_URL}/servicos/remanufatura`,
    `${BASE_URL}/faq`,
    `${BASE_URL}/busca`,
  ];

  // Slugify simples para as impressoras (mesma lógica do seu utils.ts)
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Páginas Estáticas -->
     ${staticPages
       .map((url) => {
         return `
       <url>
           <loc>${url}</loc>
           <changefreq>daily</changefreq>
           <priority>0.7</priority>
       </url>
     `;
       })
       .join('')}

     <!-- Categorias -->
     ${categories
       .map(({ slug }) => {
         return `
       <url>
           <loc>${BASE_URL}/categoria/${slug}</loc>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join('')}

     <!-- Marcas de Impressoras -->
     ${brands
       .map(({ slug }) => {
         return `
       <url>
           <loc>${BASE_URL}/impressoras/${slug}</loc>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join('')}
       
     <!-- Produtos -->
     ${products
       .map(({ slug }) => {
         return `
       <url>
           <loc>${BASE_URL}/produto/${slug}</loc>
           <changefreq>daily</changefreq>
           <priority>1.0</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

// O componente padrão não renderiza nada, o trabalho é feito no getServerSideProps
function SiteMap() {
  // getServerSideProps fará o trabalho pesado
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const prisma = new PrismaClient();

  try {
    // 1. Buscar dados dinâmicos do banco
    // Usamos Promise.all para buscar tudo em paralelo e ser mais rápido
    const [products, categories, brands, printers] = await Promise.all([
      prisma.product.findMany({
        select: { slug: true }, // Adicione updatedAt se tiver esse campo no schema para lastmod
      }),
      prisma.category.findMany({
        select: { slug: true },
      }),
      prisma.brand.findMany({
        select: { slug: true },
      }),
      prisma.printer.findMany({
        select: { modelName: true },
      }),
    ]);

    // 2. Gerar o XML
    const sitemap = generateSiteMap(products, categories, brands, printers);

    // 3. Definir o cabeçalho para XML
    res.setHeader('Content-Type', 'text/xml');
    // Cachear o sitemap por 1 hora (3600s) no CDN e 5 min (300s) no navegador
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
    
    // 4. Enviar o XML
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    res.statusCode = 500;
    res.end();
  } finally {
    await prisma.$disconnect();
  }

  return {
    props: {},
  };
};

export default SiteMap;