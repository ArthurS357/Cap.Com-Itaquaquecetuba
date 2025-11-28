import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/cards/ProductCard';
import SEO from '@/components/Seo';
import Link from 'next/link';
import { FaHeart, FaArrowRight, FaRegHeart } from 'react-icons/fa';

export default function FavoritesPage() {
  const { items } = useWishlist();

  return (
    <div className="animate-fade-in-up min-h-[60vh]">
      <SEO title="Meus Favoritos" description="Seus produtos salvos para depois." />

      <div className="flex items-center gap-3 mb-8 border-b border-surface-border pb-4">
        <FaHeart className="text-red-500 text-3xl" />
        <h1 className="text-3xl font-bold text-text-primary">Meus Favoritos</h1>
        <span className="bg-surface-border text-text-secondary px-3 py-1 rounded-full text-sm font-medium">
          {items.length} itens
        </span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative">
               <ProductCard product={{
                 id: item.id,
                 name: item.name,
                 slug: item.slug,
                 imageUrl: item.imageUrl,
                 price: item.price,
                 brand: { name: '' } 
               }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-card rounded-2xl border border-surface-border">
          <div className="w-20 h-20 bg-surface-border rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <FaRegHeart size={40} /> 
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Sua lista está vazia</h2>
          <p className="text-text-secondary mb-8">Você ainda não salvou nenhum produto.</p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors"
          >
            Explorar Produtos <FaArrowRight />
          </Link>
        </div>
      )}
    </div>
  );
}
