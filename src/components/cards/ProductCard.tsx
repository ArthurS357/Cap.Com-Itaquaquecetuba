import Link from 'next/link';
import Image from 'next/image';

// Define o tipo mínimo que o ProductCard precisa para renderizar
type MinimalProduct = {
  id: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  brand: {
    name: string;
  };
};

type ProductCardProps = {
  product: MinimalProduct | null | undefined;
};

const ProductCard = ({ product }: ProductCardProps) => {
  // console.log('Rendering ProductCard with product:', product); // Debug

  // Renderização principal (produto válido com slug e marca)
  if (product && product.slug && product.brand) {
    return (
      <Link href={`/produto/${product.slug}`} key={product.id}>
        <div className="group bg-surface-card rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between items-center text-center border border-surface-border hover:scale-105">
          
          {/* Imagem do produto */}
          {product.imageUrl ? (
            <div className="bg-white p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px]">
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
            <div className="bg-surface-border p-2 rounded-md mb-4 flex justify-center items-center aspect-square w-full max-w-[200px]">
              <span className="text-text-subtle text-sm">Sem imagem</span>
            </div>
          )}

          {/* Informações do produto */}
          <div className="w-full">
            <h2 className="text-lg font-semibold text-text-primary">{product.name}</h2>
            <p className="text-sm text-text-subtle mt-2">{product.brand.name}</p>
          </div>

          {/* Efeito de hover */}
          <div className="w-1/2 h-1 bg-brand-accent rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </Link>
    );
  } 

  else {
    if (!product) {
      console.warn('Rendering non-link ProductCard: product prop is null/undefined.');
    } else if (!product.slug) {
      console.warn('Rendering non-link ProductCard: slug is missing.', product);
    } else if (!product.brand) {
      console.warn('Rendering non-link ProductCard: brand is missing.', product);
    }

    const key = product ? product.id : Math.random();
    const name = product ? product.name : 'Produto Inválido';
    const brandName = product && product.brand ? product.brand.name : 'Marca Desconhecida';
    const imageUrl = product ? product.imageUrl : null;

    return (
      <div key={key} className="bg-surface-card rounded-xl p-4 shadow-lg border border-surface-border flex flex-col justify-between items-center text-center opacity-50 cursor-not-allowed h-full">
        
        {/* Imagem ou placeholder (Fallback) */}
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

        {/* Informações (Fallback) */}
        <div className="w-full">
          <h2 className="text-lg font-semibold text-text-primary">{name}</h2>
          <p className="text-sm text-text-subtle mt-2">{brandName}</p>
        </div>

        {/* Linha (Fallback) */}
        <div className="w-1/2 h-1 bg-gray-500 rounded-full mt-4"></div>
      </div>
    );
  }
};

export default ProductCard;