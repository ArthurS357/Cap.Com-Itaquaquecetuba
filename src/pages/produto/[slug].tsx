import Link from 'next/link';
import Image from 'next/image';
import { slugify } from '@/lib/utils';
import type { Product, Brand } from '@prisma/client'; // Importa os tipos completos

// Define o tipo esperado como o tipo Product completo mais a Brand completa
type ProductCardProps = {
  product: Product & { brand: Brand };
};

const ProductCard = ({ product }: ProductCardProps) => {
  // ***** DEBUG: Logar o produto recebido *****
  console.log('Rendering ProductCard with product:', product);
  // *******************************************

  // Verifica se 'product' existe E se 'product.slug' existe antes de criar o Link
  // Isso protege contra 'product' ser undefined/null e contra 'slug' ser null
  if (product && product.slug) {
    return (
      <Link href={`/produto/${product.slug}`} key={product.id}>
        <div className="group bg-surface-card rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between items-center text-center border border-surface-border hover:scale-105">
          {product.imageUrl ? (
            <div className="bg-white p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px] bg-surface-border">
              <Image
                src={product.imageUrl}
                alt={product.name}
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
          <div className="w-full">
            <h2 className="text-lg font-semibold text-text-primary">{product.name}</h2>
            <p className="text-sm text-text-subtle mt-2">{product.brand.name}</p>
          </div>
          <div className="w-1/2 h-1 bg-brand-accent rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>
    );
  } else {
    // Se product ou product.slug não existirem, renderiza um placeholder não clicável
    // Loga um aviso se chegou aqui por causa de um produto inválido
    if (product) {
      console.warn('Rendering non-link ProductCard because slug is missing:', product);
    } else {
      console.warn('Rendering non-link ProductCard because product prop is undefined/null');
    }
    const key = product ? product.id : Math.random(); // Usa ID se disponível, senão chave aleatória
    const name = product ? product.name : 'Produto Inválido';
    const brandName = product && product.brand ? product.brand.name : 'Marca Desconhecida';
    const imageUrl = product ? product.imageUrl : null;

    return (
      <div key={key} className="bg-surface-card rounded-xl p-4 shadow-lg border border-surface-border flex flex-col justify-between items-center text-center opacity-50 cursor-not-allowed h-full">
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
           <div className="w-full">
            <h2 className="text-lg font-semibold text-text-primary">{name}</h2>
            <p className="text-sm text-text-subtle mt-2">{brandName}</p>
          </div>
           <div className="w-1/2 h-1 bg-gray-500 rounded-full mt-4"></div>
      </div>
    );
  }
};

export default ProductCard;

