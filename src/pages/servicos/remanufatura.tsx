import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SEO from '@/components/Seo';
import { FaRecycle, FaCheckCircle, FaWhatsapp, FaLeaf, FaHandHoldingUsd } from 'react-icons/fa';
import { getWhatsappLink } from '@/config/store';

const RemanufacturingPage = () => {
  const whatsappLink = getWhatsappLink("Olá! Gostaria de saber mais sobre a remanufatura de cartuchos.");

  const advantages = [
    {
      icon: <FaHandHoldingUsd className="text-green-600 w-8 h-8" />,
      title: "Economia de até 60%",
      desc: "Reduza drasticamente seus custos de impressão sem perder qualidade."
    },
    {
      icon: <FaLeaf className="text-green-500 w-8 h-8" />,
      title: "Sustentabilidade",
      desc: "Reutilizar cartuchos evita que plástico e metal vão para o lixo."
    },
    {
      icon: <FaCheckCircle className="text-brand-primary w-8 h-8" />,
      title: "Qualidade Garantida",
      desc: "Usamos tintas e pó de toner de alta performance e testamos cada unidade."
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <SEO 
        title="Remanufatura de Cartuchos e Toners" 
        description="Economize até 60% com recarga e remanufatura de cartuchos e toners em Itaquaquecetuba. Qualidade e garantia." 
      />

      {/* Hero Section */}
      <div className="bg-surface-card rounded-2xl p-8 md:p-12 mb-12 text-center border border-surface-border shadow-sm relative overflow-hidden">
        <div className="relative z-10">
            <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full text-green-600">
                <FaRecycle size={48} />
            </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
            Remanufatura de Cartuchos
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Impressão de qualidade não precisa custar caro. 
            Transformamos o seu cartucho vazio em um novo, pronto para imprimir muito mais.
            </p>
        </div>
      </div>

      {/* Como Funciona (Passo a Passo) */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-text-primary text-center mb-10">Como Funciona o Processo?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-card p-6 rounded-xl border border-surface-border text-center">
                <span className="block text-5xl font-bold text-brand-light mb-4">1</span>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Avaliação</h3>
                <p className="text-text-secondary">Analisamos o circuito e a carcaça do seu cartucho vazio para garantir que ele pode ser reutilizado.</p>
            </div>
            <div className="bg-surface-card p-6 rounded-xl border border-surface-border text-center">
                <span className="block text-5xl font-bold text-brand-light mb-4">2</span>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Limpeza e Recarga</h3>
                <p className="text-text-secondary">Removemos resíduos antigos e recarregamos com a quantidade exata de tinta ou toner premium.</p>
            </div>
            <div className="bg-surface-card p-6 rounded-xl border border-surface-border text-center">
                <span className="block text-5xl font-bold text-brand-light mb-4">3</span>
                <h3 className="text-xl font-semibold text-text-primary mb-2">Teste Final</h3>
                <p className="text-text-secondary">Testamos a impressão para assegurar que não há falhas antes de lhe entregar.</p>
            </div>
        </div>
      </div>

      {/* Vantagens (Grid com Ícones) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {advantages.map((adv, index) => (
             <div key={index} className="flex flex-col items-center text-center p-6 hover:bg-surface-card rounded-xl transition-colors duration-300">
                <div className="mb-4 bg-surface-background p-3 rounded-full shadow-sm border border-surface-border">
                    {adv.icon}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{adv.title}</h3>
                <p className="text-text-secondary">{adv.desc}</p>
            </div>
        ))}
      </div>

      {/* CTA Final */}
      <div className="bg-brand-primary/10 rounded-2xl p-8 md:p-12 text-center border border-brand-primary/20">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-dark mb-4">Não jogue dinheiro fora!</h2>
        <p className="text-text-secondary mb-8 max-w-2xl mx-auto text-lg">
          Traga seus cartuchos vazios para a Cap.Com ou consulte nossos modelos à base de troca.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:scale-105"
        >
          <FaWhatsapp size={24} />
          Cotar Recarga no WhatsApp
        </a>
      </div>
    </div>
  );
};

export default RemanufacturingPage;
