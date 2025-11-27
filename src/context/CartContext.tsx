import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

export type CartItem = {
  id: number;
  name: string;
  slug: string;
  price: number | null;
  imageUrl: string | null;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  cartCount: number;
  isCartOpen: boolean;
  toggleCart: () => void;
};

const CartContext = createContext<CartContextType>({} as CartContextType);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('capcom_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao carregar carrinho', e);
      }
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('capcom_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        toast.success('Quantidade atualizada no orçamento!');
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      toast.success('Adicionado ao orçamento!');
      setIsCartOpen(true); // Abre o carrinho automaticamente ao adicionar
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        slug: product.slug, 
        price: product.price, 
        imageUrl: product.imageUrl, 
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('capcom_cart');
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      cartCount: items.reduce((acc, item) => acc + item.quantity, 0),
      isCartOpen,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
