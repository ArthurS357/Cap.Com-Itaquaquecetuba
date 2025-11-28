import { GetStaticPaths, GetStaticProps } from 'next';
import { Product, Brand, Category, Printer } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import SEO from '@/components/Seo';
import ProductCard from '@/components/cards/ProductCard';
import { FaWhatsapp, FaTruck, FaShieldAlt, FaTag, FaArrowLeft, FaCheckCircle, FaShoppingBag } from 'react-icons/fa';
import { getWhatsappLink, STORE_INFO } from '@/config/store';
import { prisma } from '@/lib/prisma';
import { useCart } from '@/context/CartContext'; 
import RecentlyViewed from '@/components/RecentlyViewed'; 

// Tipagem dos dados
type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  compatibleWith: { printer: Printer }[];
};

type ProductPageProps = {
  product: ProductWithRelations;
  relatedProducts: (Product & { brand: Brand; category: Category })[];
};

export default function ProductPage({ product, relatedProducts }: ProductPageProps) {
  // 1. O hook deve ser chamado SEMPRE na raiz do componente, antes de qualquer retorno
  const { addToCart } = useCart();

  // 2. verifica se o produto existe
  if (!product) return null;

  const whatsappMessage = `Olá! Vi o produto *${product.name}* no site e gostaria de saber mais.`;
  const whatsappLink = getWhatsappLink(whatsappMessage);

  return (
    <div className="animate-fade-in-up pb-16">
      <SEO
        title={product.name}
        description={product.description || `Compre ${product.name} na ${STORE_INFO.name}. Qualidade e melhor preço.`}
        image={product.imageUrl || undefined}
      />

      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors">
          <FaArrowLeft /> Voltar para a loja
        </Link>
      </div>

      <div className="bg-surface-card border border-surface-border rounded-2xl p-6 md:p-10 shadow-sm mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* Imagem */}
          <div className="relative bg-white rounded-xl overflow-hidden border border-surface-border aspect-square flex items-center justify-center p-4">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={500}
                height={500}
                className="object-contain max-h-full w-auto hover:scale-105 transition-transform duration-500"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="text-gray-300 text-6xl">📷</div>
            )}
            <span className="absolute top-4 left-4 bg-brand-light text-brand-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {product.category.name}
            </span>
          </div>

          {/* Informações */}
          <div className="flex flex-col h-full">
            <div className="mb-2 text-brand-primary font-semibold flex items-center gap-2">
              <FaTag size={14} /> {product.brand.name}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-text-secondary mb-6 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* --- IMPRESSORAS COMPATÍVEIS --- */}
            {product.compatibleWith && product.compatibleWith.length > 0 && (
              <div className="mb-8 bg-surface-background p-4 rounded-xl border border-surface-border">
                <h3 className="text-sm font-bold text-text-primary mb-3 uppercase tracking-wide flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" /> Compatível com:
                </h3>
                <ul className="grid grid-cols-2 gap-2 text-sm text-text-secondary max-h-40 overflow-y-auto custom-scrollbar">
                  {product.compatibleWith.map((relation, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0" />
                      {relation.printer.modelName}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto">
              <div className="mb-8">
                <span className="block text-sm text-text-secondary mb-1">Preço à vista:</span>
                {product.price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-green-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-text-primary">Sob Consulta</span>
                )}
              </div>

              {/* Ações de Venda */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => addToCart(product)}
                  className="w-full md:w-auto text-center bg-brand-primary hover:bg-brand-dark text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <FaShoppingBag size={24} />
                  Adicionar ao Orçamento
                </button>

                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto text-center border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FaWhatsapp size={20} />
                  Falar agora no WhatsApp
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-surface-border">
                <div className="flex items-center gap-3 text-text-secondary text-sm">
                  <FaTruck className="text-brand-primary text-xl" />
                  <span>Entrega Rápida<br />em Itaquaquecetuba</span>
                </div>
                <div className="flex items-center gap-3 text-text-secondary text-sm">
                  <FaShieldAlt className="text-brand-primary text-xl" />
                  <span>Garantia de<br />Qualidade Cap.Com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-text-primary mb-8 border-l-4 border-brand-primary pl-4">
            Quem viu este, viu também
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((related) => (
              <ProductCard key={related.id} product={related} />
            ))}
          </div>
        </div>
      )}

      {/* Seção de Vistos Recentemente */}
      <RecentlyViewed currentProduct={product} />
    </div>
  );
}

// 1. GERA OS CAMINHOS (SLUGS) NO BUILD
export const getStaticPaths: GetStaticPaths = async () => {
  const products = await prisma.product.findMany({
    select: { slug: true },
  });

  const paths = products
    .filter((p) => p.slug)
    .map((product) => ({
      params: { slug: product.slug! },
    }));

  return { paths, fallback: 'blocking' };
};

// 2. GERA OS DADOS DA PÁGINA (COM REVALIDAÇÃO)
export const getStaticProps: GetStaticProps = async (context) => {
  const slug = context.params?.slug as string;

  if (!slug) return { notFound: true };

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      compatibleWith: {
        include: {
          printer: true
        }
      }
    },
  });

  if (!product) {
    return { notFound: true };
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id }
    },
    take: 4,
    include: {
      brand: true,
      category: true
    },
    orderBy: { id: 'desc' }
  });

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
    },
    revalidate: 60, 
  };
};
