import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SEO from '@/components/Seo';
import { FaWrench, FaCheckCircle, FaWhatsapp } from 'react-icons/fa';
import { getWhatsappLink } from '@/config/store';

const MaintenancePage = () => {
  const whatsappLink = getWhatsappLink("Olá! Gostaria de saber mais sobre a manutenção de impressoras.");

  const benefits = [
    "Diagnóstico rápido e preciso",
    "Limpeza profunda de cabeçotes",
    "Desentupimento de jatos de tinta",
    "Substituição de peças desgastadas",
    "Reset de almofadas",
    "Garantia no serviço prestado"
  ];

  return (
    <div className="animate-fade-in-up">
      <SEO 
        title="Manutenção de Impressoras" 
        description="Serviço especializado de manutenção e conserto de impressoras HP, Epson, Brother e Canon em Itaquaquecetuba." 
      />

      {/* Hero Section */}
      <div className="bg-surface-card rounded-2xl p-8 md:p-12 mb-12 text-center border border-surface-border shadow-sm">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-brand-light rounded-full text-brand-primary">
            <FaWrench size={48} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
          Manutenção de Impressoras
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto">
          A sua impressora parou? Está a imprimir com falhas? Nós resolvemos. 
          Trazemos o seu equipamento de volta à vida com qualidade e rapidez.
        </p>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-text-primary">Por que fazer manutenção?</h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            Muitas vezes, uma impressora é descartada por problemas simples como falta de limpeza ou entupimento. 
            A nossa manutenção preventiva e corretiva aumenta a vida útil do seu equipamento e evita gastos desnecessários com uma máquina nova.
          </p>
          
          <div className="bg-surface-card p-6 rounded-xl border border-surface-border">
            <h3 className="text-xl font-semibold text-text-primary mb-4">O que incluímos:</h3>
            <ul className="grid grid-cols-1 gap-3">
              {benefits.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-text-secondary">
                  <FaCheckCircle className="text-green-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Área para Imagem Ilustrativa */}
        <div className="relative h-[400px] bg-gray-200 rounded-xl overflow-hidden shadow-lg border border-surface-border">
            {/* Placeholder - Quando tiver uma foto real da bancada, substitui aqui */}
            <Image 
              src="/images/background-hero.jpg" 
              alt="Técnico a reparar impressora"
              fill
              className="object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white font-medium text-lg">Bancada especializada para todas as marcas</p>
            </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="text-center py-12 border-t border-surface-border">
        <h2 className="text-2xl font-bold text-text-primary mb-4">Precisa de um orçamento?</h2>
        <p className="text-text-secondary mb-8">
          Fale diretamente com o técnico pelo WhatsApp. É rápido e sem compromisso.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:scale-105"
        >
          <FaWhatsapp size={24} />
          Falar com Técnico Agora
        </a>
      </div>
    </div>
  );
};

export default MaintenancePage;
