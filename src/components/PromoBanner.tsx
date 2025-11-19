import { useState, useEffect } from 'react';
import { FaBullhorn, FaTimes } from 'react-icons/fa';

export default function PromoBanner() {
  const [banner, setBanner] = useState({ text: '', isActive: false });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Busca a configuração do banner ao carregar o site
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.value) {
          setBanner({ text: data.value, isActive: data.isActive });
        }
      })
      .catch(() => null); // Ignora erros silenciosamente
  }, []);

  // Se não houver texto, não estiver ativo ou o usuário fechou, não mostra nada
  if (!banner.isActive || !banner.text || !isVisible) {
    return null;
  }

  return (
    <div className="bg-brand-primary text-white text-sm py-2 px-4 relative z-50 animate-fade-in-down shadow-md border-b border-white/10">
      <div className="container mx-auto flex justify-center items-center text-center pr-8">
        <span className="flex items-center gap-2 font-medium">
          <FaBullhorn className="animate-pulse" />
          {banner.text}
        </span>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Fechar aviso"
      >
        <FaTimes size={12} />
      </button>
    </div>
  );
}
