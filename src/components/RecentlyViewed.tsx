import { useEffect, useState } from 'react';
import ProductCard, { MinimalProduct } from './cards/ProductCard';

type RecentlyViewedProps = {
  currentProduct: MinimalProduct;
};

export default function RecentlyViewed({ currentProduct }: RecentlyViewedProps) {
  const [history, setHistory] = useState<MinimalProduct[]>([]);

  useEffect(() => {
    // 1. Ler histórico atual
    const stored = localStorage.getItem('capcom_recent_viewed');
    let items: MinimalProduct[] = stored ? JSON.parse(stored) : [];

    // 2. Remover o produto atual se já existir (para evitar duplicatas e movê-lo para o topo)
    items = items.filter((p) => p.id !== currentProduct.id);

    // 3. Adicionar o produto atual no início
    items.unshift(currentProduct);

    // 4. Manter apenas os últimos 5 itens
    if (items.length > 5) {
      items = items.slice(0, 5);
    }

    // 5. Salvar de volta
    localStorage.setItem('capcom_recent_viewed', JSON.stringify(items));

    // 6. Atualizar estado para exibição (Removendo o produto atual da lista VISUAL)
    // Intenção é mostrar o que ELE VIU ANTES, não o que ele está vendo agora.
    setHistory(items.filter((p) => p.id !== currentProduct.id).slice(0, 4));
  }, [currentProduct]);

  if (history.length === 0) return null;

  return (
    <div className="mt-16 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-text-primary mb-6 border-b border-surface-border pb-2">
        Vistos Recentemente
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {history.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
