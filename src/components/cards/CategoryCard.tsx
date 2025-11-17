import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@prisma/client'; 

type CategoryCardProps = {
  category: Category; 
};

const CategoryCard = ({ category }: CategoryCardProps) => (
  <Link href={`/categoria/${category.slug}`} key={category.id}
    className="rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-surface-background block h-full" 
  >
    <div className="group bg-surface-card rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center border border-surface-border hover:scale-105">
      {category.imageUrl && (
        <div className="mb-6 rounded-md overflow-hidden bg-surface-border flex justify-center items-center aspect-square w-full max-w-[250px]">
          <Image
            src={category.imageUrl}
            alt={`Imagem para a categoria ${category.name}`}
            width={250}
            height={250}
            className="object-cover"
          />
        </div>
      )}
      <h2 className="text-2xl font-semibold text-text-primary">{category.name}</h2>
      <div className="w-1/3 h-1 bg-brand-accent rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  </Link>
);

export default CategoryCard;
