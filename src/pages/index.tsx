import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import { useState } from 'react';
import SEO from '../components/Seo';
import CategoryCard from '../components/cards/CategoryCard';
import ProductCard from '../components/cards/ProductCard';
import Image from 'next/image';
import Link from 'next/link';
import SearchBar from '../components/SearchBar';
import { FaAward, FaRegClock, FaStar, FaMoneyBillWave, FaCheck } from 'react-icons/fa';
import { STORE_INFO, GOOGLE_MAPS_EMBED_URL } from '@/config/store';
import { prisma } from '@/lib/prisma';
import { Category, Product, Brand } from '@prisma/client';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import toast from 'react-hot-toast'; 

// Tipo auxiliar para os produtos em destaque (Produto + Marca)
type FeaturedProduct = Product & { brand: Brand };

// --- Ícones SVG ---
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
  featuredProducts: FeaturedProduct[];
}> = async () => {

  // 1. Busca Categorias Principais
  const allMainCategories = await prisma.category.findMany({
    where: {
      parentId: null,
      slug: { not: undefined }
    },
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

  // 2. Busca Produtos em Destaque OTIMIZADO
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      price: true,
      isFeatured: true,
      brand: {
        select: {
          name: true
        }
      }
    },
    orderBy: { id: 'desc' }
  });

  return {
    props: {
      mainCategories: JSON.parse(JSON.stringify(orderedCategories)),
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
    },
    revalidate: 60,
  };
};

function HomePage({ mainCategories, featuredProducts }: InferGetStaticPropsType<typeof getStaticProps>) {
  const encodedAddress = encodeURIComponent(STORE_INFO.address);
  const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;

  // Estados de Animação
  const [categoriasRef, categoriasVisible] = useScrollAnimation({ threshold: 0.1 });
  const [servicosRef, servicosVisible] = useScrollAnimation({ threshold: 0.1 });
  const [sobreNosRef, sobreNosVisible] = useScrollAnimation({ threshold: 0.1 });
  const [localizacaoRef, localizacaoVisible] = useScrollAnimation({ threshold: 0.1 });

  // Estado para feedback do botão PIX
  const [pixCopied, setPixCopied] = useState(false);

  // Função para Copiar PIX com TOAST
  const handleCopyPix = () => {
    const pixKey = STORE_INFO.pixKey;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKey)
        .then(() => {
          setPixCopied(true);
          setTimeout(() => setPixCopied(false), 3000);

          // Toast de Sucesso
          toast.success("Chave CNPJ copiada!", {
            duration: 4000,
            icon: '💸',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          });
        })
        .catch(() => {
          toast.error("Erro ao copiar PIX.");
        });
    }
  };

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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 z-10"></div>
        <div className="relative z-20 p-6 max-w-3xl mx-auto animate-fade-in-up flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Cap.Com Itaquaquecetuba
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 drop-shadow-md">
            O que você procura? Cartuchos, toners, impressoras e mais!
          </p>

          {/* --- BARRA DE BUSCA --- */}
          <div className="w-full max-w-lg mb-8 flex justify-center">
            <SearchBar />
          </div>

          {/* --- BOTÕES DE AÇÃO --- */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full flex-wrap">
            <a
              href="#categorias"
              className="inline-block bg-brand-primary text-white font-semibold py-3 px-8 rounded-lg hover:bg-brand-dark transition-colors duration-300 shadow-lg transform hover:scale-105 w-full sm:w-auto"
            >
              Ver Categorias
            </a>

            {/* BOTÃO PIX (COM TOAST) */}
            <button
              onClick={handleCopyPix}
              className={`inline-flex items-center justify-center gap-2 font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 w-full sm:w-auto cursor-pointer border-2 ${pixCopied
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                }`}
              title="Copie o CNPJ para pagar sem taxas"
            >
              {pixCopied ? <FaCheck /> : <FaMoneyBillWave />}
              {pixCopied ? "Copiado!" : "Pagar com PIX"}
            </button>

            <a
              href="#servicos"
              className="inline-block bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-surface-background transition-colors duration-300 shadow-lg transform hover:scale-105 w-full sm:w-auto"
            >
              Nossos Serviços
            </a>
          </div>

          <p className="text-xs text-gray-300 mt-3 opacity-80">
            *Dica: Pagamento via CNPJ (PIX) é isento de taxas.
          </p>
        </div>
      </section>

      {/* ===== SEÇÃO DE PRODUTOS EM DESTAQUE ===== */}
      {featuredProducts && featuredProducts.length > 0 && (
        <>
          <section className="max-w-6xl mx-auto mb-16 animate-fade-in-up px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-text-primary flex items-center justify-center gap-3">
                <FaStar className="text-yellow-500" /> Ofertas em Destaque
              </h2>
              <p className="text-lg text-text-secondary mt-2">
                Confira nossa seleção especial para você.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="h-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>

          {/* Separador */}
          <hr className="border-t-2 border-surface-border max-w-5xl mx-auto my-16" />
        </>
      )}

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

          {/* --- 1. CARTÃO REMANUFATURA (COM LINK) --- */}
          <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex items-start gap-4 hover:border-brand-primary/50 transition-colors group cursor-pointer">
            <IconRecycle />
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                <Link href="/servicos/remanufatura">Remanufatura de Cartuchos e Toners</Link>
              </h3>
              <p className="text-text-secondary">
                Alternativas econômicas e sustentáveis sem abrir mão da qualidade. Prolongue a vida útil dos seus suprimentos.
                <br />
                <Link href="/servicos/remanufatura" className="text-brand-accent text-sm font-semibold mt-2 inline-block hover:underline">
                  Saiba mais &rarr;
                </Link>
              </p>
            </div>
          </div>

          {/* --- 2. CARTÃO MANUTENÇÃO (COM LINK) --- */}
          <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border flex items-start gap-4 hover:border-brand-primary/50 transition-colors group cursor-pointer">
            <IconWrench />
            <div>
              <h3 className="text-2xl font-semibold text-text-primary mb-2 group-hover:text-brand-primary transition-colors">
                <Link href="/servicos/manutencao">Manutenção de Impressoras</Link>
              </h3>
              <p className="text-text-secondary">
                Realizamos manutenção preventiva e corretiva em uma ampla variedade de impressoras para garantir o pleno funcionamento.
                <br />
                <Link href="/servicos/manutencao" className="text-brand-accent text-sm font-semibold mt-2 inline-block hover:underline">
                  Saiba mais &rarr;
                </Link>
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ===== BARRA SEPARADORA ===== */}
      <hr className="border-t-2 border-surface-border max-w-5xl mx-auto my-16" />

      {/* ===== 2. SEÇÃO "SOBRE NÓS" ===== */}
      <section
        id="sobre-nos"
        ref={sobreNosRef as React.RefObject<HTMLElement>}
        className={`max-w-6xl mx-auto mb-16 animate-on-scroll ${sobreNosVisible ? 'animate-slide-in-up' : ''}`}
      >
        <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">Sobre Nós</h2>

        {/* Grid de 2 colunas: Texto na esquerda, Card de Infos na direita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* Coluna 1: Texto Descritivo */}
          <div className="text-lg text-text-secondary leading-relaxed space-y-4">
            <p>
              A Cap.Com em Itaquaquecetuba é uma empresa dedicada a soluções completas em impressão. Especializamo‑nos na remanufatura de cartuchos e toners, oferecendo alternativas econômicas e sustentáveis sem abrir mão da qualidade.
            </p>
            <p>
              Também realizamos manutenção preventiva e corretiva em uma ampla variedade de impressoras, além de serviços gerais de manutenção para garantir o pleno funcionamento dos seus equipamentos.
            </p>
            <p>
              A empresa é representada por Ezequias e Edila, proprietários da loja, que atuam diretamente como prestadores de serviços — oferecendo atendimento personalizado, transparência e compromisso com resultados. Venha nos conhecer!
            </p>
          </div>

          {/* Coluna 2: Card de Informações (Experiência e Horários) */}
          <div className="bg-surface-card p-6 rounded-xl shadow-lg border border-surface-border sticky top-28">

            {/* Item 1: Experiência */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-surface-border">
              <FaAward className="w-10 h-10 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-1">Mais de 10 Anos no Mercado</h3>
                <p className="text-text-secondary">Tradição e confiança em Itaquaquecetuba, oferecendo os melhores serviços de impressão e manutenção.</p>
              </div>
            </div>

            {/* Item 2: Horários */}
            <div className="flex items-start gap-4">
              <FaRegClock className="w-10 h-10 text-brand-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">Horário de Atendimento</h3>
                <ul className="space-y-2 text-text-secondary">
                  <li className="flex justify-between">
                    <strong>Segunda a Sexta:</strong>
                    <span>9h00 – 18h00</span>
                  </li>
                  <li className="flex justify-between">
                    <strong>Sábado:</strong>
                    <span>9h00 – 13h00</span>
                  </li>
                  <li className="mt-2 text-sm text-text-subtle">
                    *Exceto feriados
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
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
        <p className="text-lg text-text-secondary mb-8">{STORE_INFO.address}</p>

        <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg border border-surface-border mb-8">
          <iframe
            src={GOOGLE_MAPS_EMBED_URL}
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Localização da ${STORE_INFO.name} no Google Maps`}
          ></iframe>
        </div>

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