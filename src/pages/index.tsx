import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import SEO from '../components/Seo';
import CategoryCard from '../components/cards/CategoryCard';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: number | null;
};

const useScrollAnimation = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      ...options,
    });

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [options]);

  return [elementRef, isVisible] as const;
};


// --- Ícones SVG como componentes simples ---
const IconRecycle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-brand-primary flex-shrink-0 mt-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const IconWrench = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-brand-primary flex-shrink-0 mt-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-4.243-4.243l3.275-3.275a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
  </svg>
);

const IconWaze = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C7.8 0 4 3.8 4 8c0 5.4 7.8 15.8 8 16 0.2 0.2 8-10.6 8-16C20 3.8 16.2 0 12 0zM12 12c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3S13.7 12 12 12z" fill="white" />
  </svg>
);

// --- Lógica da Página ---
export const getStaticProps: GetStaticProps<{
  mainCategories: Category[];
}> = async () => {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const allMainCategories = await prisma.category.findMany({
    where: {
      parentId: null,
      slug: { not: undefined }
    },
    // Selecionar apenas os campos necessários para o tipo Category definido acima
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      parentId: true,
    }
  });

  const orderedCategories = allMainCategories.sort((a, b) => {
    const order = ['Cartuchos e Toners', 'Tintas', 'Impressoras'];
    return order.indexOf(a.name) - order.indexOf(b.name);
  });

  await prisma.$disconnect();

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

  const [categoriasRef, categoriasVisible] = useScrollAnimation({ threshold: 0.1 });
  const [servicosRef, servicosVisible] = useScrollAnimation({ threshold: 0.1 });
  const [sobreNosRef, sobreNosVisible] = useScrollAnimation({ threshold: 0.1 });
  const [localizacaoRef, localizacaoVisible] = useScrollAnimation({ threshold: 0.1 });

  return (
    <>
      <SEO title="Início" />

      {/* ===== SEÇÃO HERO ===== */}
      <section className="relative flex items-center justify-center text-center h-[70vh] mb-16 overflow-hidden text-white rounded-lg shadow-xl">
        <Image
          src="/images/background-hero.jpg"
          alt="Fundo da seção de boas-vindas"
          fill
          objectFit="cover"
          style={{ zIndex: 0 }}
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 z-10"></div>
        <div className="relative z-20 p-6 max-w-3xl mx-auto animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Cap.Com Itaquaquecetuba
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md">
            O que você procura? Cartuchos, toners, impressoras e mais!
          </p>

          {/* Container dos botões */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Botão Primário (Categorias) */}
            <a
              href="#categorias"
              className="inline-block bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 shadow-lg transform hover:scale-105 w-full sm:w-auto"
            >
              Ver Categorias
            </a>

            {/* Botão Secundário (Serviços)*/}
            <a
              href="#servicos"
              className="inline-block bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-surface-background transition-colors duration-300 shadow-lg transform hover:scale-105 w-full sm:w-auto"
            >
              Nossos Serviços
            </a>
          </div>
        </div>
      </section>

      {/* ===== SEÇÃO DAS CATEGORIAS ===== */}
      <section
        id="categorias"
        ref={categoriasRef as React.RefObject<HTMLElement>}
        className={`mb-16 animate-on-scroll ${categoriasVisible ? 'animate-slide-in-up' : ''}`}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Navegue por Categoria</h2>
          <p className="text-lg text-text-secondary mt-2">Encontre o que você precisa.</p>
        </div>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {mainCategories.map((category) => (
            <div key={category.id} >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      </section>

      {/* ===== BARRA SEPARADORA ===== */}
      <hr className="border-t-2 border-surface-border max-w-5xl mx-auto my-16" />

      {/* ===== SEÇÃO: NOSSOS SERVIÇOS ===== */}
      <section
        id="servicos"
        ref={servicosRef as React.RefObject<HTMLElement>}
        className={`mb-16 animate-on-scroll ${servicosVisible ? 'animate-slide-in-up' : ''}`}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary">Nossos Serviços</h2>
          <p className="text-lg text-text-secondary mt-2">Soluções completas para suas necessidades de impressão.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Serviço 1: Remanufatura */}
          <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex items-start gap-4 hover:border-brand-primary/50 transition-colors">
            <IconRecycle />
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-2">Remanufatura de Cartuchos e Toners</h3>
              <p className="text-text-secondary">
                Alternativas econômicas e sustentáveis sem abrir mão da qualidade. Prolongue a vida útil dos seus suprimentos.
              </p>
            </div>
          </div>
          {/* Card Serviço 2: Manutenção */}
          <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex items-start gap-4 hover:border-brand-primary/50 transition-colors">
            <IconWrench />
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
      <section
        id="sobre-nos"
        ref={sobreNosRef as React.RefObject<HTMLElement>}
        className={`max-w-4xl mx-auto text-center mb-16 animate-on-scroll ${sobreNosVisible ? 'animate-slide-in-right' : ''}`}
      >
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
      <section
        id="localizacao"
        ref={localizacaoRef as React.RefObject<HTMLElement>}
        className={`text-center mb-16 animate-on-scroll ${localizacaoVisible ? 'animate-slide-in-up' : ''}`}
      >
        <h2 className="text-3xl font-bold text-text-primary mb-6">Nossa Localização</h2>
        <p className="text-lg text-text-secondary mb-8">{storeAddress}</p>

        {/* Mapa Incorporado */}
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

        {/* Botão Waze */}
        <div className="flex justify-center items-center">
          <a
            href={wazeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#33ccff] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#29a3cc] transition-colors duration-300 shadow-md transform hover:scale-105"
          >
            <IconWaze />
            Navegar com Waze
          </a>
        </div>
      </section>
    </>
  );
}

export default HomePage;

