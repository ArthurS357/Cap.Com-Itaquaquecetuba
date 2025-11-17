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
      className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 
                 bg-[#25D366] text-white 
                 p-3 md:p-4 rounded-full shadow-xl 
                 hover:bg-[#128C7E] transition-all duration-300 
                 hover:scale-110 hover:-translate-y-1
                 flex items-center justify-center border-2 border-white"
      aria-label="Fale conosco no WhatsApp"
      title="Fale conosco no WhatsApp"
    >
      {/* Ícone menor no mobile (24px) e maior no desktop (32px) */}
      <FaWhatsapp className="w-6 h-6 md:w-8 md:h-8" />
    </a>
  );
};

export default WhatsAppButton;
