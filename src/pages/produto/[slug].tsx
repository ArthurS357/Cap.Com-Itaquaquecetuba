import { slugify } from '@/lib/utils'; 
import { PrismaClient, Prisma } from '@prisma/client'; 
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import SEO from '@/components/Seo';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/cards/ProductCard';
import Link from 'next/link'; 

// 3. Definir o tipo usando Prisma.ProductGetPayload para corresponder à consulta em getStaticProps
type ProductDetails = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    compatibleWith: {
      include: {
        printer: {
          include: {
            brand: true;
          }
        };
      };
    };
  };
}>;

// 3. Definir o tipo usando Prisma.ProductGetPayload para corresponder à consulta na API
type SimilarProduct = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true; 
  };
}>;

export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  let paths: { params: { slug: string } }[] = [];
  try {
    const products = await prisma.product.findMany({
      where: { slug: { not: undefined, not: null } }, 
      select: { slug: true }
    });

    paths = products
      .filter(product => product.slug) 
      .map((product) => ({
        params: { slug: product.slug! }, 
      }));
  } catch (error) {
    console.error("Erro ao gerar paths estáticos para produtos:", error);
    // Retorna paths vazios em caso de erro para evitar que a build falhe completamente
  } finally {
    await prisma.$disconnect();
  }

  return { paths, fallback: 'blocking' }; // 'blocking' gera a página no primeiro acesso se não existir
};

// Busca os dados do produto específico para a página estática
export const getStaticProps: GetStaticProps<{
  product: ProductDetails | null;
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) return { notFound: true };

  const prisma = new PrismaClient();
  let productDetails: ProductDetails | null = null; 

  try {
    // Busca o produto pelo slug, incluindo marca, categoria e impressoras compatíveis (com a marca da impressora)
    productDetails = await prisma.product.findUnique({
      where: { slug: slug },
      include: {
        brand: true, 
        category: true, 
        compatibleWith: { 
          include: {
            printer: { 
              include: {
                brand: true 
              }
            },
          },
          orderBy: { printer: { modelName: 'asc' } } 
        },
      },
    });

    // Retorna 404 se o produto não for encontrado
    if (!productDetails) {
      await prisma.$disconnect(); // Desconecta antes de retornar notFound
      return { notFound: true };
    }

    // Serializa os dados (necessário para tipos Date e potencialmente outros)
    const serializableProduct = JSON.parse(JSON.stringify(productDetails));

    await prisma.$disconnect(); 

    return {
      props: {
        product: serializableProduct,
      },
      revalidate: 60, // Revalida a página a cada 60 segundos (ISR)
    };
  } catch (error) {
      console.error(`Erro ao buscar dados do produto para slug "${slug}":`, error);
      await prisma.$disconnect(); 
      return { notFound: true }; 
  }
};

// Componente da Página do Produto
function ProductPage({ product }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]); // Usa o novo tipo
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);
  const [errorSimilar, setErrorSimilar] = useState<string | null>(null); // Estado para erro

  useEffect(() => {
    // Só executa se 'product' (obtido via props) existir e tiver um ID
    if (product?.id) {
      setIsLoadingSimilar(true);
      setErrorSimilar(null); // Reseta o erro ao iniciar a busca
      fetch(`/api/products/${product.id}`)
        .then(res => {
            if (!res.ok) {
                // Tenta pegar a mensagem de erro da API, se houver
                return res.json().then(errData => {
                    throw new Error(errData.error || `Erro HTTP: ${res.status}`);
                }).catch(() => {
                    // Se não conseguir parsear o JSON do erro, lança erro genérico
                    throw new Error(`Erro HTTP: ${res.status}`);
                });
            }
            return res.json();
         })
        .then(data => {
          // Verifica se a API retornou o objeto esperado com a propriedade similarProducts
          if (data && data.similarProducts && Array.isArray(data.similarProducts)) {
            setSimilarProducts(data.similarProducts);
          } else {
            setSimilarProducts([]);
            console.warn("API não retornou a propriedade 'similarProducts' como um array ou ela está vazia.");
          }
        })
        .catch(error => {
          console.error("Erro ao buscar produtos similares:", error);
          // Verifica se o erro é uma instância de Error para acessar a mensagem
          const errorMessage = error instanceof Error ? error.message : "Não foi possível carregar produtos similares.";
          setErrorSimilar(errorMessage); // Guarda a mensagem de erro
          setSimilarProducts([]);
        })
        .finally(() => {
          setIsLoadingSimilar(false); 
        });
    } else if (!router.isFallback && !product) {
        // Se não está em fallback e o produto é null (veio de getStaticProps), não faz busca
        setIsLoadingSimilar(false);
    }
  }, [product?.id, router.isFallback]); 

  // Exibe spinner durante fallback ou carregamento inicial no cliente
  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  // Exibe mensagem se o produto não foi encontrado
  if (!product) {
    return <div className="text-center text-xl text-text-secondary mt-10">Produto não encontrado.</div>;
  }

  return (
    <>
      <SEO
        title={product.name}
        description={`Detalhes sobre ${product.name}, da marca ${product.brand.name}. Encontre impressoras compatíveis e mais.`}
      />

      {/* Card principal com detalhes do produto */}
      <div className="bg-surface-card p-6 md:p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-8 border border-surface-border animate-fade-in-up">
        {/* Imagem do Produto */}
        {product.imageUrl ? (
            <div className="bg-white p-4 rounded-lg flex-shrink-0 w-full md:w-1/3 flex justify-center">
              <Image
                  src={product.imageUrl}
                  alt={`Imagem do produto ${product.name}`}
                  width={300}
                  height={300}
                  className="object-contain max-h-[300px]"
                  priority
              />
            </div>
        ) : (
          <div className="bg-gray-200 p-4 rounded-lg flex-shrink-0 w-full md:w-1/3 h-[300px] flex items-center justify-center text-gray-500">
            Imagem indisponível
          </div>
        )}
        {/* Informações do Produto */}
        <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{product.name}</h1>
            <p className="text-lg text-text-secondary mt-2"><strong>Marca:</strong> {product.brand.name}</p>
            <p className="text-lg text-text-secondary">
              <strong>Categoria:</strong>{' '}
              <Link href={`/categoria/${product.category.slug}`} className="text-brand-accent hover:underline">
                 {product.category.name}
              </Link>
            </p>
            <p className="mt-4 text-text-secondary">{product.description || 'Descrição detalhada em breve.'}</p>

            {/* Bloco de consulta via WhatsApp */}
            <div className="mt-8 bg-gradient-to-r from-brand-primary to-blue-700 p-6 rounded-xl shadow-lg text-white text-center">
                <p className="text-lg font-semibold">
                    {product.type.includes('RECARGA') ? 'Valor para o serviço de recarga:' : 'Informações e Preço:'}
                </p>
                <p className="text-3xl font-bold mt-2 drop-shadow-sm">
                    Consulte via WhatsApp!
                </p>
                <a href="https://wa.me/5511996388426" target="_blank" rel="noopener noreferrer"
                   className="mt-4 inline-block bg-white text-brand-primary font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors duration-300 shadow-md transform hover:scale-105">
                    Iniciar Conversa
                </a>
            </div>
        </div>
      </div>

      {/* Seção de Impressoras Compatíveis */}
      {product.compatibleWith && product.compatibleWith.length > 0 && (
        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-3xl font-bold mb-6 text-center text-text-primary">Impressoras Compatíveis</h2>
          <div className="bg-surface-card p-6 rounded-xl shadow-sm border border-surface-border">
            <ul className="list-disc list-inside columns-1 sm:columns-2 lg:columns-3 text-text-secondary gap-x-8">
              {product.compatibleWith.map((comp) => (
                // Garante que comp.printer e comp.printer.brand existem antes de criar o link
                comp.printer ? (
                  <li key={comp.printer.id} className="mb-2 break-inside-avoid">
                      {comp.printer.brand ? (
                        <Link href={`/impressoras/${slugify(comp.printer.brand.name)}`} className="hover:text-brand-accent hover:underline">
                          {comp.printer.modelName}
                        </Link>
                      ) : (
                        // Se a marca da impressora não estiver carregada (não deveria acontecer com o include), mostra só o nome
                        comp.printer.modelName
                      )}
                  </li>
                ) : null
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* --- Produtos Similares --- */}
      {/* Mostra o spinner enquanto carrega E não houve erro */}
      {isLoadingSimilar && !errorSimilar && (
          <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <LoadingSpinner />
              <p className="text-text-secondary mt-2">A carregar produtos similares...</p>
          </div>
       )}

      {/* Mostra mensagem de erro, se houver, e não estiver carregando */}
      {errorSimilar && !isLoadingSimilar && (
          <div className="mt-12 text-center text-red-500 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <p>Erro ao carregar produtos similares: {errorSimilar}</p>
          </div>
      )}

      {/* Renderiza a seção apenas se NÃO estiver carregando, NÃO houver erro E houver produtos similares */}
      {!isLoadingSimilar && !errorSimilar && similarProducts.length > 0 && (
          <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <h2 className="text-3xl font-bold mb-6 text-center text-text-primary">Produtos Similares</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {similarProducts.map((similar, index) => (
                      <div key={similar.id} className="animate-fade-in-up" style={{ animationDelay: `${200 + index * 50}ms` }}>
                          <ProductCard product={similar} />
                      </div>
                  ))}
              </div>
          </div>
      )}

       {/* Mensagem se não houver produtos similares (após carregar, sem erro e array vazio) - Comentada para não poluir a UI */}
       {/* {!isLoadingSimilar && !errorSimilar && similarProducts.length === 0 && (
            <div className="mt-12 text-center text-text-secondary animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <p>Nenhum produto similar encontrado.</p>
            </div>
       )} */}
    </>
  );
}

export default ProductPage;

