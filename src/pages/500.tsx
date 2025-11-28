import Link from 'next/link';
import SEO from '@/components/Seo';
import { FaTools, FaWhatsapp, FaHome } from 'react-icons/fa';
import { getWhatsappLink } from '@/config/store';

export default function Custom500() {
  const whatsappLink = getWhatsappLink("Olá! O site apresentou um erro técnico e preciso de ajuda.");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in-up">
      <SEO
        title="Erro no Servidor"
        description="Ocorreu um erro inesperado em nossos servidores."
      />

      {/* Ícone de Manutenção */}
      <div className="text-brand-primary mb-6 opacity-80 bg-brand-light p-6 rounded-full">
        <FaTools size={60} />
      </div>

      {/* Título Grande */}
      <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
        Erro 500
      </h1>

      {/* Subtítulo */}
      <h2 className="text-2xl font-semibold text-text-secondary mb-6">
        Ops! Algo deu errado do nosso lado.
      </h2>

      {/* Texto Explicativo */}
      <p className="text-text-subtle mb-8 max-w-lg text-lg leading-relaxed">
        Tivemos um problema técnico temporário. Nossos técnicos já foram notificados (talvez a impressora deles também tenha dado problema 😉).
      </p>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-xl
                     hover:bg-brand-dark transition-all duration-300 shadow-md hover:scale-105"
        >
          <FaHome size={20} />
          Tentar de Novo (Home)
        </Link>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 border-2 border-[#25D366] text-[#25D366] font-bold py-3 px-8 rounded-xl
                     hover:bg-[#25D366] hover:text-white transition-all duration-300 shadow-sm"
        >
          <FaWhatsapp size={20} />
          Informar no WhatsApp
        </a>
      </div>
    </div>
  );
}