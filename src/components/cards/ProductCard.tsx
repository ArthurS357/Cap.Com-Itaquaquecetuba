import Link from 'next/link';
import Image from 'next/image';
// A função slugify não é usada neste componente, pode ser removida se não for usada em futuras modificações.
// import { slugify } from '@/lib/utils';
import type { Product, Brand } from '@prisma/client'; // Importa os tipos completos

// Define o tipo esperado como o tipo Product completo mais a Brand completa
type ProductCardProps = {
  // Permite que product seja potencialmente nulo ou indefinido para melhor tratamento de erro
  product: (Product & { brand: Brand }) | null | undefined;
};

const ProductCard = ({ product }: ProductCardProps) => {
  // ***** DEBUG: Logar o produto recebido *****
  // Este log ajudará a identificar qual 'product' está causando o erro no console do navegador/servidor.
  console.log('Rendering ProductCard with product:', product);
  // *******************************************

  // Verifica se 'product' existe, se 'product.brand' existe E se 'product.slug' existe antes de criar o Link
  // Isso protege contra 'product' ser undefined/null, 'brand' ser null (pouco provável com include) e contra 'slug' ser null
  if (product && product.brand && product.slug) {
    return (
      // Link para a página do produto usando o slug
      <Link href={`/produto/${product.slug}`} key={product.id}>
        <div className="group bg-surface-card rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between items-center text-center border border-surface-border hover:scale-105">
          {/* Mostra a imagem do produto ou um placeholder */}
          {product.imageUrl ? (
            <div className="bg-white p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px] bg-surface-border">
              <Image
                src={product.imageUrl}
                alt={product.name} // Alt text descritivo
                width={200}
                height={200}
                className="object-contain" // Garante que a imagem caiba sem distorcer
              />
            </div>
          ) : (
             // Placeholder caso não haja imageUrl
             <div className="bg-surface-border p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px]">
               <span className="text-text-subtle text-sm">Sem imagem</span>
             </div>
          )}
          {/* Informações do produto */}
          <div className="w-full">
            <h2 className="text-lg font-semibold text-text-primary">{product.name}</h2>
            <p className="text-sm text-text-subtle mt-2">{product.brand.name}</p>
          </div>
          {/* Efeito visual de linha no hover */}
          <div className="w-1/2 h-1 bg-brand-accent rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>
    );
  } else {
    // ---- Fallback: Renderiza um placeholder não clicável ----
    // Loga um aviso para ajudar a depurar por que chegou aqui.
    if (!product) {
      console.warn('Rendering non-link ProductCard because product prop is undefined/null.');
    } else if (!product.slug) {
      console.warn('Rendering non-link ProductCard because slug is missing:', product);
    } else if (!product.brand){
       console.warn('Rendering non-link ProductCard because brand is missing:', product);
    }

    // Define valores padrão seguros para evitar erros
    const key = product ? product.id : Math.random();
    const name = product ? product.name : 'Produto Inválido';
    // Verifica se brand existe antes de acessar name
    const brandName = product && product.brand ? product.brand.name : 'Marca Desconhecida';
    const imageUrl = product ? product.imageUrl : null;

    return (
      // Div que simula o card, mas não é clicável e tem opacidade reduzida
      <div key={key} className="bg-surface-card rounded-xl p-4 shadow-lg border border-surface-border flex flex-col justify-between items-center text-center opacity-50 cursor-not-allowed h-full">
           {/* Imagem ou placeholder */}
           {imageUrl ? (
            <div className="bg-white p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px] bg-surface-border">
              <Image
                src={imageUrl}
                alt={name}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          ) : (
             <div className="bg-surface-border p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px]">
               <span className="text-text-subtle text-sm">Sem imagem</span>
             </div>
          )}
           {/* Informações (com valores padrão) */}
           <div className="w-full">
            <h2 className="text-lg font-semibold text-text-primary">{name}</h2>
            <p className="text-sm text-text-subtle mt-2">{brandName}</p>
          </div>
           {/* Linha cinza indicando estado desabilitado/inválido */}
           <div className="w-1/2 h-1 bg-gray-500 rounded-full mt-4"></div>
      </div>
    );
  }
};

export default ProductCard;

