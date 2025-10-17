import Link from 'next/link';
import Image from 'next/image';
import { slugify } from '@/lib/utils';
import type { Product, Brand } from '@prisma/client';

type ProductCardProps = {
  product: Product & { brand: Brand };
};

const ProductCard = ({ product }: ProductCardProps) => (
  <Link href={`/produto/${slugify(product.name)}`} key={product.id}>
    <div className="group bg-surface-card rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col justify-between items-center text-center border border-surface-border">
      {product.imageUrl && (
        <div className="bg-white p-2 rounded-md mb-4">
          <Image src={product.imageUrl} alt={product.name} width={200} height={200} className="object-contain" />
        </div>
      )}
      <div className="w-full">
        <h2 className="text-lg font-semibold text-text-primary">{product.name}</h2>
        <p className="text-sm text-text-subtle mt-2">{product.brand.name}</p>
      </div>
      <div className="w-1/2 h-1 bg-brand-primary rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  </Link>
);

export default ProductCard;