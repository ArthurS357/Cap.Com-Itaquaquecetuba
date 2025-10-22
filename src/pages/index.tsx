import { PrismaClient, Category } from '@prisma/client';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '@/components/Seo';
import CategoryCard from '@/components/cards/CategoryCard';
import Image from 'next/image';
// Importe um ícone, por exemplo, um ícone de ferramenta (ajuste o caminho se necessário)
// Se não tiver ícones, pode remover esta linha e a parte dos ícones nas seções de serviço.
// import { WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Exemplo usando Heroicons (precisaria instalar)

export const getStaticProps: GetStaticProps<{
  mainCategories: Category[];
}> = async () => {
  const prisma = new PrismaClient();

  const allMainCategories = await prisma.category.findMany({
    where: {
      parentId: null,
      slug: { not: undefined }
    },
  });

  const orderedCategories = allMainCategories.sort((a, b) => {
    const order = ['Cartuchos e Toners', 'Tintas', 'Impressoras'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  return {
    props: {
      mainCategories: JSON.parse(JSON.stringify(orderedCategories)),
    },
    revalidate: 60,
  };
};

function HomePage({ mainCategories }: InferGetStaticPropsType<typeof getStaticProps>) {
  const storeAddress = "Estr. dos Índios, 765 - Jardim Mossapyra, Itaquaquecetuba - SP, 08570-000";
  const encodedAddress = encodeURIComponent(storeAddress);
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d228.7868357502089!2d-46.32073719989995!3d-23.43919608454872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce7dab465c779d%3A0xe55f25ea7b533e3b!2sCap.Com!5e0!3m2!1spt-BR!2sbr!4v1760818394343!5m2!1spt-BR!2sbr";
  const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

  return (
    <>
      {/* Componente para SEO */}
      <SEO title="Início" />

      {/* ===== SEÇÃO HERO ===== */}
      <section className="relative flex items-center justify-center text-center h-[70vh] mb-16 overflow-hidden text-white rounded-lg shadow-xl">
        <Image
          src="/images/background-hero.jpg"
          alt="Fundo da seção de boas-vindas"
          layout="fill"
          objectFit="cover"
          quality={85} 
          className="absolute inset-0 z-0"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 z-10"></div>
        
        {/* Conteúdo da Hero Section */}
        <div className="relative z-20 p-6 max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg"> 
            Cap.Com Itaquaquecetuba
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md"> 
            O que você procura? Cartuchos, toners, impressoras e mais!
          </p>
          <a
            href="#categorias"
            className="inline-block bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 shadow-lg transform hover:scale-105" // Efeito de escala no hover
          >
            Ver Categorias
          </a>
        </div>
      </section>

      {/* ===== SEÇÃO DAS CATEGORIAS ===== */}
      <section id="categorias" className="mb-16">
        <div className="text-center mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl font-bold text-text-primary">Navegue por Categoria</h2>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-up" 
          style={{ animationDelay: '300ms' }}
        >
          {mainCategories.map((category, index) => (
            <div key={category.id} className="animate-fade-in-up" style={{ animationDelay: `${300 + index * 100}ms` }}>
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== BARRA SEPARADORA ===== */}
      <hr className="border-t-2 border-surface-border max-w-5xl mx-auto my-16" />

      {/* ===== NOVA SEÇÃO: NOSSOS SERVIÇOS ===== */}
      <section id="servicos" className="mb-16 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Nossos Serviços</h2>
          <p className="text-lg text-text-secondary mt-2">Soluções completas para suas necessidades de impressão.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Serviço 1: Remanufatura */}
          <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex items-start gap-4 hover:border-brand-primary/50 transition-colors">
            {/* Adicionar Icone */}
             {/* <ArrowPathIcon className="h-10 w-10 text-brand-primary flex-shrink-0 mt-1" /> */}
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-2">Remanufatura de Cartuchos e Toners</h3>
              <p className="text-text-secondary">
                Alternativas econômicas e sustentáveis sem abrir mão da qualidade. Prolongue a vida útil dos seus suprimentos.
              </p>
            </div>
          </div>
          {/* Card Serviço 2: Manutenção */}
          <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex items-start gap-4 hover:border-brand-primary/50 transition-colors">
            {/* Adicionar Icone */}
            {/* <WrenchScrewdriverIcon className="h-10 w-10 text-brand-primary flex-shrink-0 mt-1" /> */}
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-2">Manutenção de Impressoras</h3>
              <p className="text-text-secondary">
                Realizamos manutenção preventiva e corretiva em uma ampla variedade de impressoras para garantir o pleno funcionamento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BARRA SEPARADORA ===== */}
      <hr className="border-t-2 border-surface-border max-w-5xl mx-auto my-16" />


      {/* ===== SEÇÃO SOBRE NÓS ===== */}
      <section id="sobre-nos" className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-3xl font-bold text-text-primary mb-6">Sobre Nós</h2>
        <p className="text-lg text-text-secondary leading-relaxed">
          A Cap.Com em Itaquaquecetuba é uma empresa dedicada a soluções completas em impressão. Especializamo‑nos na remanufatura de cartuchos e toners, oferecendo alternativas econômicas e sustentáveis sem abrir mão da qualidade. Também realizamos manutenção preventiva e corretiva em uma ampla variedade de impressoras, além de serviços gerais de manutenção para garantir o pleno funcionamento dos seus equipamentos.
        </p>
        <p className="text-lg text-text-secondary leading-relaxed mt-4">
          A empresa é representada por Ezequias e Edila, proprietários da loja, que atuam diretamente como prestadores de serviços — oferecendo atendimento personalizado, transparência e compromisso com resultados. Venha nos conhecer!
        </p>
      </section>

       {/* ===== BARRA SEPARADORA ===== */}
       <hr className="border-t-2 border-surface-border max-w-5xl mx-auto my-16" />

      {/* ===== SEÇÃO DE LOCALIZAÇÃO COM IFRAME ===== */}
      <section id="localizacao" className="text-center mb-16 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <h2 className="text-3xl font-bold text-text-primary mb-6">Nossa Localização</h2>
        <p className="text-lg text-text-secondary mb-8">{storeAddress}</p>

        {/* Mapa Incorporado com container responsivo */}
        <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg border border-surface-border mb-8">
          <iframe
            src={googleMapsEmbedUrl} 
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={false} 
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Localização da Cap.Com Itaquaquecetuba no Google Maps"
          ></iframe>
        </div>

        {/* Botão Waze para navegação direta */}
        <div className="flex justify-center items-center">
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#33ccff] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#29a3cc] transition-colors duration-300 shadow-md transform hover:scale-105" 
          >
             {/* Adicionar ícone do Waze aqui */}
            Navegar com Waze
          </a>
        </div>
      </section>
    </>
  );
}

export default HomePage;
