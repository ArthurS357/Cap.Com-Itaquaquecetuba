import Link from 'next/link';
import Image from 'next/image';
import { slugify } from '@/lib/utils';
import type { Category } from '@prisma/client';

type CategoryCardProps = {
  category: Category;
};

const CategoryCard = ({ category }: CategoryCardProps) => (
  <Link href={`/categoria/${slugify(category.name)}`} key={category.id}>
    <div className="group bg-surface-card rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col items-center text-center border border-surface-border hover:scale-105">
      {category.imageUrl && (
        <Image
          src={category.imageUrl}
          alt={`Imagem para a categoria ${category.name}`}
          width={250}
          height={250}
          className="object-cover mb-6 rounded-md"
        />
      )}
      <h2 className="text-2xl font-semibold text-text-primary">{category.name}</h2>
      <div className="w-1/3 h-1 bg-brand-primary rounded-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  </Link>
);

export default CategoryCard;
