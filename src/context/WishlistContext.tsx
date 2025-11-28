import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

// Tipo simplificado do produto para salvar apenas o necessário
export type WishlistItem = {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  imageUrl: string | null;
  categoryName?: string;
};

type WishlistContextType = {
  items: WishlistItem[];
  toggleWishlist: (product: any) => void;
  removeFromWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  wishlistCount: number;
};

const WishlistContext = createContext<WishlistContextType>({} as WishlistContextType);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('capcom_wishlist');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar favoritos', e);
      }
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('capcom_wishlist', JSON.stringify(items));
  }, [items]);

  const toggleWishlist = (product: any) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      
      if (exists) {
        toast.success('Removido dos favoritos');
        return prev.filter((i) => i.id !== product.id);
      } else {
        toast.success('Adicionado aos favoritos!');
        return [...prev, {
          id: product.id,
          name: product.name,
          slug: product.slug || '',
          price: product.price,
          imageUrl: product.imageUrl,
          categoryName: product.category?.name
        }];
      }
    });
  };

  const removeFromWishlist = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
    toast.success('Removido dos favoritos');
  };

  const isInWishlist = (productId: number) => {
    return items.some((i) => i.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      items, 
      toggleWishlist, 
      removeFromWishlist, 
      isInWishlist,
      wishlistCount: items.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
