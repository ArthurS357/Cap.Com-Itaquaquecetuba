import { useState, useEffect } from 'react';
import { FaBullhorn, FaTimes } from 'react-icons/fa';

export default function PromoBanner() {
  const [banner, setBanner] = useState({ text: '', isActive: false });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Busca a configuração do banner ao carregar o site
    fetch('/api/config')
      .then((res) => {
        // Se a resposta HTTP for um erro (ex: 404, 500), joga um erro para o bloco .catch
        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status} ao buscar config do banner.`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.value) {
          setBanner({ text: data.value, isActive: data.isActive });
        }
      })
      .catch((error) => {
        // Agora, logamos o erro para fins de monitoramento.
        // O banner não será exibido, mantendo a UX limpa.
        console.error('Falha ao buscar ou processar configuração do banner. Verifique o servidor /api/config.', error);
      });
  }, []);

  // Usa uma variável explícita para o status de exibição
  const shouldRender = banner.isActive && banner.text && isVisible;

  // Se não deve renderizar, retorna null
  if (!shouldRender) {
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
