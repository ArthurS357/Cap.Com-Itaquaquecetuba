import { GetServerSideProps } from 'next';
import { PrismaClient } from '@prisma/client';

// URL base 
const BASE_URL = 'https://cap-com-itaquaquecetuba.vercel.app';

function generateSiteMap(
  products: { slug: string; updatedAt?: Date }[],
  categories: { slug: string }[],
  brands: { slug: string }[]
) {
  // Rotas estáticas que sempre existem
  const staticPages = [
    `${BASE_URL}/`,
    `${BASE_URL}/servicos/manutencao`,
    `${BASE_URL}/servicos/remanufatura`,
    `${BASE_URL}/faq`,
    `${BASE_URL}/busca`,
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

// O componente padrão não renderiza nada
function SiteMap() {
  // getServerSideProps fará o trabalho pesado
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const prisma = new PrismaClient();

  try {
    // 1. Buscar dados dinâmicos do banco
    const [products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        select: { slug: true },
      }),
      prisma.category.findMany({
        select: { slug: true },
      }),
      prisma.brand.findMany({
        select: { slug: true },
      }),
    ]);

    // 2. Gerar o XML
    const sitemap = generateSiteMap(products, categories, brands);

    // 3. Definir o cabeçalho para XML
    res.setHeader('Content-Type', 'text/xml');
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