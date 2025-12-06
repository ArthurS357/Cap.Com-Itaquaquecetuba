import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getWhatsappLink } from '@/config/store';
import { FaWhatsapp, FaShoppingBag, FaCommentDots, FaTimes, FaHeart } from 'react-icons/fa';
import Link from 'next/link';

export default function FloatingActionGroup() {
  const { cartCount, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const whatsappLink = getWhatsappLink();

  const baseButtonClass = "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 border-2 border-white text-white cursor-pointer";

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 pointer-events-none">

      {/* 1. BOTÃO DO CARRINHO (Notificação Automática) */}
      <div className={`transition-all duration-500 ease-in-out transform ${cartCount > 0 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 hidden'}`}>
        <button
          onClick={toggleCart}
          className={`${baseButtonClass} bg-brand-primary hover:bg-brand-dark pointer-events-auto relative`}
          title="Abrir Carrinho"
          aria-label="Abrir carrinho de orçamento"
        >
          <FaShoppingBag size={20} />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
            {cartCount}
          </span>
        </button>
      </div>

      {/* 2. BOTÃO DE FAVORITOS (Só aparece se tiver itens) */}
      <div className={`transition-all duration-500 ease-in-out transform ${wishlistCount > 0 ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 hidden'}`}>
        <Link
          href="/favoritos"
          className={`${baseButtonClass} bg-white text-red-500 hover:text-red-600 hover:bg-red-50 pointer-events-auto relative border-red-100`}
          title="Ver Favoritos"
          aria-label="Ver meus favoritos"
        >
          <FaHeart size={20} />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white">
            {wishlistCount}
          </span>
        </Link>
      </div>

      {/* 3. BOTÃO DO WHATSAPP (Escondido no Menu) */}
      <div
        className={`transition-all duration-300 transform ${isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-10 opacity-0 pointer-events-none'
          }`}
      >
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseButtonClass} bg-[#25D366] hover:bg-[#128C7E]`}
          title="Falar no WhatsApp"
          aria-label="Falar conosco no WhatsApp"
        >
          <FaWhatsapp size={24} />
        </a>
      </div>

      {/* 4. BOTÃO DE MENU / TOGGLE (Sempre visível) */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`${baseButtonClass} bg-gray-700 hover:bg-gray-800 pointer-events-auto group`}
        title="Opções"
        aria-label={isMenuOpen ? "Fechar menu de ações" : "Abrir menu de ações"}
      >
        {isMenuOpen ? <FaTimes size={20} /> : <FaCommentDots size={20} />}
      </button>

    </div>
  );
}