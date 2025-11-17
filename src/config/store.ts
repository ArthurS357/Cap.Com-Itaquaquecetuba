export const STORE_INFO = {
  name: "Cap.Com Itaquaquecetuba",
  address: "Estr. dos Índios, 765 - Jardim Mossapyra, Itaquaquecetuba - SP, 08570-000",
  phoneDisplay: "(11) 99638-8426",
  whatsappNumber: "5511996388426", // Número limpo para a API do WhatsApp
  whatsappDefaultMessage: "Olá! Visitei o site e gostaria de mais informações.",
};

// Helper para gerar link do WhatsApp
export const getWhatsappLink = (message = STORE_INFO.whatsappDefaultMessage) => {
  return `https://wa.me/${STORE_INFO.whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const GOOGLE_MAPS_EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d228.7868357502089!2d-46.32073719989995!3d-23.43919608454872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce7dab465c779d%3A0xe55f25ea7b533e3b!2sCap.Com!5e0!3m2!1spt-BR!2sbr!4v1760818394343!5m2!1spt-BR!2sbr";
