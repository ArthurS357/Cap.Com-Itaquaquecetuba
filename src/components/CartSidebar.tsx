import { useCart } from '@/context/CartContext';
import { STORE_INFO, getWhatsappLink } from '@/config/store';
import { FaTimes, FaTrash, FaWhatsapp, FaShoppingBag } from 'react-icons/fa';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function CartSidebar() {
  const { items, isCartOpen, toggleCart, removeFromCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Gera a mensagem do WhatsApp
  const handleCheckout = () => {
    if (items.length === 0) return;

    let message = `*Olá! Gostaria de um orçamento para os seguintes itens:* \n\n`;
    items.forEach((item) => {
      message += `▪️ ${item.quantity}x *${item.name}*\n`;
    });
    
    message += `\n*Aguardo o retorno!*`;
    
    const link = getWhatsappLink(message);
    window.open(link, '_blank');
  };

  // Botão Flutuante (Aparece quando fechado)
  if (!isCartOpen) {
    return (
      <button
        onClick={toggleCart}
        className="fixed bottom-24 right-4 md:bottom-28 md:right-8 z-40 bg-white text-brand-primary p-3 md:p-4 rounded-full shadow-xl border-2 border-brand-primary hover:scale-110 transition-transform flex items-center justify-center"
        title="Ver Orçamento"
      >
        <FaShoppingBag size={24} />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
            {items.reduce((acc, i) => acc + i.quantity, 0)}
          </span>
        )}
      </button>
    );
  }

  // Sidebar (Aparece quando aberto)
  return (
    <>
      {/* Overlay Escuro */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity" 
        onClick={toggleCart}
      />

      {/* Painel Lateral */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-sm bg-surface-card shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-surface-border flex flex-col">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-background">
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FaShoppingBag /> Orçamento
          </h2>
          <button onClick={toggleCart} className="p-2 hover:bg-surface-border rounded-full text-text-secondary">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center text-text-subtle py-10">
              <p>Seu carrinho de orçamento está vazio.</p>
              <button onClick={toggleCart} className="mt-4 text-brand-primary font-medium hover:underline">
                Voltar a navegar
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 bg-surface-background p-3 rounded-lg border border-surface-border">
                <div className="w-16 h-16 relative bg-white rounded-md border border-surface-border flex-shrink-0">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">Sem foto</div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-text-primary line-clamp-2">{item.name}</h4>
                  <p className="text-xs text-brand-primary font-bold mt-1">
                    {item.price ? `R$ ${item.price.toFixed(2)}` : 'Sob Consulta'}
                  </p>
                  <p className="text-xs text-text-subtle mt-1">Qtd: {item.quantity}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-400 hover:text-red-600 p-2 self-start"
                  title="Remover"
                >
                  <FaTrash size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Rodapé e Ação */}
        <div className="p-4 border-t border-surface-border bg-surface-background">
          <button
            onClick={handleCheckout}
            disabled={items.length === 0}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaWhatsapp size={20} /> Enviar Orçamento
          </button>
        </div>
      </div>
    </>
  );
}
