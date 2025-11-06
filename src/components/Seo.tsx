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
      
      {/* ----- novos ícones ----- */}
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content="website" />
    </Head>
  );
};

export default SEO;
