import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { getWhatsappLink } from '@/config/store';

const WhatsAppButton = () => {
  const whatsappLink = getWhatsappLink();

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      // Estilos: 
      // - fixed bottom-6 right-6: Posiciona no canto inferior direito
      // - z-50: Garante que fica acima de tudo
      // - animate-bounce (opcional, mas removi para não incomodar, usei hover:scale)
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl 
                 hover:bg-[#128C7E] transition-all duration-300 hover:scale-110 hover:-translate-y-1
                 flex items-center justify-center border-2 border-white"
      aria-label="Fale conosco no WhatsApp"
      title="Fale conosco no WhatsApp"
    >
      <FaWhatsapp size={32} />
    </a>
  );
};

export default WhatsAppButton;
