import Link from 'next/link';
import Image from 'next/image';
import FavoriteButton from '../FavoriteButton';

export type MinimalProduct = {
  id: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  price: number | null;
  brand: {
    name: string;
  } | null;
};

type ProductCardProps = {
  product: MinimalProduct | null | undefined;
};

const ProductCard = ({ product }: ProductCardProps) => {

  // Renderização principal (produto válido com slug e marca)
  if (product && product.slug && product.brand) {
    return (
      <Link href={`/produto/${product.slug}`} key={product.id} className="block h-full">
        <div className="group bg-surface-card rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between items-center text-center border border-surface-border hover:scale-105">

          {/* Imagem do produto */}
          {product.imageUrl ? (
            <div className="relative bg-white p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px]">
              
              {/* Botão de Favorito */}
              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton product={product} className="bg-white/80 p-1.5 rounded-full shadow-sm backdrop-blur-sm" />
              </div>

              <Image
                src={product.imageUrl}
                alt={product.name}
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          ) : (
            // Placeholder (sem imagem)
            <div className="relative bg-surface-border p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px]">
              
              <div className="absolute top-2 right-2 z-10">
                <FavoriteButton product={product} className="bg-white/80 p-1.5 rounded-full shadow-sm backdrop-blur-sm" />
              </div>

              <span className="text-text-subtle text-sm">Sem imagem</span>
            </div>
          )}

          {/* Informações do produto */}
          <div className="w-full">
            <h2 className="text-lg font-semibold text-text-primary">{product.name}</h2>
            <p className="text-sm text-text-subtle mt-2">{product.brand.name}</p>
            
            {/* CORREÇÃO AQUI: Verificação explícita > 0 para não renderizar "0" */}
            {product.price && product.price > 0 ? (
               <p className="text-sm font-bold text-green-600 mt-1">
                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
               </p>
            ) : null}
          </div>

          {/* Efeito de hover */}
          <div className="w-1/2 h-1 bg-brand-accent rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>
    );
  }

  // Renderização de Fallback (produto inválido ou incompleto)
  else {
    if (!product) {
      console.warn('Rendering non-link ProductCard: product prop is null/undefined.');
    } else if (!product.slug) {
      console.warn('Rendering non-link ProductCard: slug is missing.', product);
    } else if (!product.brand) {
      console.warn('Rendering non-link ProductCard: brand is missing.', product);
    }

    let key: number | string;
    if (product) {
      key = product.id;
    } else {
      key = Math.random();
    }
    
    const name = product ? product.name : 'Produto Inválido';
    const brandName = product && product.brand ? product.brand.name : 'Marca Desconhecida';
    const imageUrl = product ? product.imageUrl : null;

    return (
      <div key={key} className="bg-surface-card rounded-xl p-4 shadow-lg border border-surface-border flex flex-col justify-between items-center text-center opacity-50 cursor-not-allowed h-full">

        {imageUrl ? (
          <div className="bg-white p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px]">
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
