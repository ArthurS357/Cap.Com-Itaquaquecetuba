import Link from 'next/link';
import SEO from '@/components/Seo';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in-up">
      <SEO 
        title="Página Não Encontrada" 
        description="A página que você procura não existe ou foi movida." 
      />

      {/* Ícone de Alerta */}
      <div className="text-brand-primary mb-6 opacity-80">
        <FaExclamationTriangle size={80} />
      </div>

      {/* Título Grande */}
      <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-2">
        404
      </h1>
      
      {/* Subtítulo */}
      <h2 className="text-2xl font-semibold text-text-secondary mb-6">
        Ops! Página não encontrada.
      </h2>
      
      {/* Texto Explicativo */}
      <p className="text-text-subtle mb-8 max-w-md text-lg">
        Parece que o link que você tentou acessar não existe, foi alterado ou está indisponível no momento.
      </p>

      {/* Botão de Voltar */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-lg
                   hover:bg-brand-dark transition-all duration-300 shadow-md hover:scale-105"
      >
        <FaHome size={20} />
        Voltar para o Início
      </Link>
    </div>
  );
}
