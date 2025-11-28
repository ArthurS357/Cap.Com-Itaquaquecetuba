import { useWishlist } from '@/context/WishlistContext';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

type FavoriteButtonProps = {
  product: any;
  size?: number;
  className?: string;
};

export default function FavoriteButton({ product, size = 20, className = "" }: FavoriteButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Evita clicar no link do produto se estiver dentro de um card
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-300 transform hover:scale-110 active:scale-95 ${className} ${
        isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
      }`}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isFavorite ? <FaHeart size={size} /> : <FaRegHeart size={size} />}
    </button>
  );
}
