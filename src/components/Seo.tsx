import Head from 'next/head';

type SeoProps = {
  title: string;
  description?: string;
};

const SEO = ({ title, description }: SeoProps) => {
  const pageTitle = `${title} | Cap.Com Itaquaquecetuba`;
  const defaultDescription = 'Especialistas em manutenção de impressoras e remanufatura de cartuchos e toners em Itaquaquecetuba.';

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      {/* Outras tags de SEO importantes (Open Graph para redes sociais) podem ser adicionadas aqui no futuro */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
    </Head>
  );
};

export default SEO;