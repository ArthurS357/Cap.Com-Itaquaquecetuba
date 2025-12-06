import { useState, useEffect } from 'react';
import { FaWhatsapp, FaFacebook, FaLink, FaCheck } from 'react-icons/fa';

type SocialShareProps = {
  productName: string;
};

export default function SocialShare({ productName }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // Captura a URL do navegador assim que o componente carrega
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reseta o ícone após 2s
  };

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`Olha que legal esse produto: ${productName}`);

  if (!currentUrl) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-surface-border">
      <span className="text-sm text-text-subtle font-medium mr-2">Compartilhar:</span>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300"
        title="Compartilhar no WhatsApp"
      >
        <FaWhatsapp size={20} />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all duration-300"
        title="Compartilhar no Facebook"
      >
        <FaFacebook size={20} />
      </a>

      {/* Copiar Link */}
      <button
        onClick={handleCopy}
        className={`p-2.5 rounded-full transition-all duration-300 ${copied
            ? 'bg-green-100 text-green-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        title="Copiar Link"
      >
        {copied ? <FaCheck size={20} /> : <FaLink size={20} />}
      </button>

      {copied && (
        <span className="text-xs font-bold text-green-600 animate-fade-in ml-1">
          Copiado!
        </span>
      )}
    </div>
  );
}