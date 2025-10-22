import { slugify } from '@/lib/utils';
import { PrismaClient, Product, Brand, Category, PrinterCompatibility, Printer } from '@prisma/client';
import type { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { useRouter } from 'next/router';
import SEO from '@/components/Seo';
import Image from 'next/image';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useState, useEffect } from 'react'; 
import ProductCard from '@/components/cards/ProductCard'; 

// Define o tipo esperado para os detalhes do produto, incluindo relações
type ProductDetails = Product & {
  brand: Brand;
  category: Category;
  compatibleWith: (PrinterCompatibility & { printer: Printer })[];
};

// --- Tipo para os produtos similares (igual ao ProductCardProps, ajustado) ---
type SimilarProduct = Product & { brand: Brand };

// Gera os paths estáticos para cada produto com slug definido
export const getStaticPaths: GetStaticPaths = async () => {
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({
    where: { slug: { not: undefined } }, // Busca apenas produtos que têm um slug
    select: { slug: true }
  });

  // Mapeia os slugs para o formato esperado pelo Next.js
  const paths = products
    .filter(product => product.slug) // Garante que slugs nulos/undefined sejam ignorados
    .map((product) => ({
      params: { slug: product.slug! }, // O '!' assume que slug não será nulo após o filtro
  }));

  return { paths, fallback: 'blocking' }; // 'blocking' gera a página no primeiro acesso se não existir
};

// Busca os dados do produto específico para a página estática
export const getStaticProps: GetStaticProps<{
  product: ProductDetails | null;
}> = async (context) => {
  const slug = context.params?.slug as string;
  if (!slug) return { notFound: true }; // Retorna 404 se não houver slug nos parâmetros

  const prisma = new PrismaClient();

  // Busca o produto pelo slug, incluindo marca, categoria e impressoras compatíveis
  const productDetails = await prisma.product.findUnique({
    where: { slug: slug },
    include: {
      brand: true, // Inclui dados da marca
      category: true, // Inclui dados da categoria
      compatibleWith: { // Inclui a lista de compatibilidades
        include: {
          printer: true, // Para cada compatibilidade, inclui os dados da impressora
        },
        orderBy: { printer: { modelName: 'asc' } } // Ordena as impressoras compatíveis por nome
      },
    },
  });

  // Retorna 404 se o produto não for encontrado no banco de dados
  if (!productDetails) {
    return { notFound: true };
  }

  // Serializa os dados para garantir que tipos como Date sejam compatíveis com JSON
  const serializableProduct = JSON.parse(JSON.stringify(productDetails));

  return {
    props: {
      product: serializableProduct, 
    },
    revalidate: 60, 
  };
};

// Componente da Página do Produto
function ProductPage({ product }: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  // --- Estado para produtos similares e carregamento ---
  const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);

  // --- useEffect para buscar produtos similares ---
  useEffect(() => {
    // Garante que só executa se 'product' e 'product.id' existirem
    if (product?.id) {
      setIsLoadingSimilar(true); // Inicia carregamento
      fetch(`/api/products/${product.id}`)
        .then(res => {
            // Verifica se a resposta foi bem sucedida
            if (!res.ok) {
                throw new Error(`Erro HTTP: ${res.status}`);
            }
            return res.json();
         })
        .then(data => {
          // Verifica se a propriedade 'similarProducts' existe na resposta
          if (data && data.similarProducts) {
            setSimilarProducts(data.similarProducts);
          } else {
            // Se a propriedade não existir, define como array vazio para evitar erros
            setSimilarProducts([]);
            console.warn("API não retornou a propriedade 'similarProducts'.");
          }
        })
        .catch(error => {
          console.error("Erro ao buscar produtos similares:", error);
          setSimilarProducts([]); // Define como array vazio em caso de erro
          // Adicionar tratamento de erro para o usuário (ex: mostrar mensagem)
        })
        .finally(() => {
          setIsLoadingSimilar(false); // Finaliza carregamento
        });
    } else {
        // Se não houver ID do produto (ou 'product' for null), não inicia a busca
        setIsLoadingSimilar(false);
    }
  }, [product?.id]); // Dependência: product.id (o '?' evita erro se 'product' for null inicialmente)

  // Exibe spinner enquanto a página está sendo gerada (fallback: 'blocking')
  if (router.isFallback) {
    return <LoadingSpinner />;
  }

  // Exibe mensagem se o produto não foi encontrado (após getStaticProps retornar null)
  if (!product) return <div className="text-center text-xl text-text-secondary">Produto não encontrado.</div>;

  return (
    <>
      {/* Configurações de SEO da página */}
      <SEO
        title={product.name}
        description={`Detalhes sobre ${product.name}, da marca ${product.brand.name}. Encontre impressoras compatíveis e mais.`}
      />

      {/* Card principal com detalhes do produto */}
      <div className="bg-surface-card p-6 md:p-8 rounded-xl shadow-lg flex flex-col md:flex-row items-center gap-8 border border-surface-border animate-fade-in-up">
        {/* Imagem do Produto */}
        {product.imageUrl && (
            <div className="bg-white p-4 rounded-lg flex-shrink-0">
              <Image
                  src={product.imageUrl}
                  alt={`Imagem do produto ${product.name}`}
                  width={300}
                  height={300}
                  className="object-contain"
                  priority 
              />
            </div>
        )}
        {/* Informações do Produto */}
        <div className="flex-1 text-center md:text-left w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">{product.name}</h1>
            <p className="text-lg text-text-secondary mt-2"><strong>Marca:</strong> {product.brand.name}</p>
            <p className="text-lg text-text-secondary"><strong>Categoria:</strong> {product.category.name}</p>
            <p className="mt-4 text-text-secondary">{product.description || 'Descrição detalhada em breve.'}</p>

            {/* Bloco de consulta via WhatsApp com mais destaque */}
            <div className="mt-8 bg-gradient-to-r from-brand-primary to-blue-700 p-6 rounded-xl shadow-lg text-white text-center">
                <p className="text-lg font-semibold">
                    {product.type.includes('RECARGA') ? 'Valor para o serviço de recarga:' : 'Informações e Preço:'}
                </p>
                <p className="text-3xl font-bold mt-2 drop-shadow-sm">
                    Consulte via WhatsApp!
                </p>
                {/* Botão com cor de destaque */}
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
          {/* Card contendo a lista */}
          <div className="bg-surface-card p-6 rounded-xl shadow-sm border border-surface-border">
            {/* Lista com colunas responsivas */}
            <ul className="list-disc list-inside columns-1 sm:columns-2 lg:columns-3 text-text-secondary gap-x-8">
              {product.compatibleWith.map((comp) => (
                // Adicionada verificação para garantir que comp.printer existe
                comp.printer && <li key={comp.printer.id} className="mb-2 break-inside-avoid">{comp.printer.modelName}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* --- Produtos Similares --- */}
      {/* Mostra o spinner apenas enquanto estiver carregando E houver um ID de produto */}
      {isLoadingSimilar && product?.id && (
          <div className="mt-12 text-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <LoadingSpinner />
              <p className="text-text-secondary mt-2">A carregar produtos similares...</p>
          </div>
       )}

      {/* Renderiza a seção apenas se NÃO estiver carregando E houver produtos similares */}
      {!isLoadingSimilar && similarProducts && similarProducts.length > 0 && (
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
       {/* Mensagem se não houver produtos similares (após carregar) */}
       {/*!isLoadingSimilar && (!similarProducts || similarProducts.length === 0) && product?.id && (
            <div className="mt-12 text-center text-text-secondary animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <p>Nenhum produto similar encontrado.</p>
            </div>
       )*/}

    </>
  );
}

export default ProductPage;
