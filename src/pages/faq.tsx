import React from 'react';
import SEO from '@/components/Seo';
import { FaQuestionCircle, FaWhatsapp } from 'react-icons/fa';
import { getWhatsappLink } from '@/config/store';

const FAQPage = () => {
  const whatsappLink = getWhatsappLink("Olá! Tenho uma dúvida que não está no site.");

  const faqs = [
    {
      question: "O que é um cartucho remanufaturado?",
      answer: "É um cartucho original vazio que passa por um processo industrial de limpeza, substituição de peças desgastadas e recarga com tinta ou toner de alta qualidade. Ele funciona como um novo, mas custa muito menos e ajuda o meio ambiente."
    },
    {
      question: "Os cartuchos remanufaturados têm garantia?",
      answer: "Sim! Oferecemos garantia total contra defeitos de impressão. Se o cartucho apresentar falhas (que não sejam por mau uso ou nível de tinta baixo), efetuamos a troca ou o reparo."
    },
    {
      question: "Vocês fazem entrega?",
      answer: "Sim, realizamos entregas em toda a região de Itaquaquecetuba e arredores. Consulte as taxas e prazos diretamente connosco pelo WhatsApp."
    },
    {
      question: "Quanto tempo demora a manutenção de uma impressora?",
      answer: "O prazo médio para diagnóstico é de 24 a 48 horas. Após a aprovação do orçamento, o serviço é geralmente concluído em 1 a 3 dias úteis, dependendo da disponibilidade de peças."
    },
    {
      question: "Vocês compram cartuchos vazios?",
      answer: "Sim, compramos determinados modelos de cartuchos e toners originais vazios. Traga o seu material para avaliação na nossa loja ou envie uma foto pelo WhatsApp."
    },
    {
      question: "Quais são as formas de pagamento?",
      answer: "Aceitamos dinheiro, PIX e os principais cartões de crédito e débito."
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <SEO 
        title="Perguntas Frequentes (FAQ)" 
        description="Tire suas dúvidas sobre recarga de cartuchos, manutenção de impressoras e garantias na Cap.Com Itaquaquecetuba." 
      />

      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="flex justify-center mb-4">
            {/* Ícone agora em verde (green-600) */}
            <FaQuestionCircle className="text-green-600 text-5xl opacity-20" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
          Perguntas Frequentes
        </h1>
        <p className="text-lg text-text-secondary">
          Separamos as dúvidas mais comuns dos nossos clientes para o ajudar.
        </p>
      </div>

      {/* Lista de Perguntas */}
      <div className="max-w-4xl mx-auto grid gap-6 mb-16">
        {faqs.map((item, index) => (
          <div 
            key={index} 
            // Borda verde suave ao passar o mouse
            className="bg-surface-card rounded-xl p-6 border border-surface-border shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-3 flex items-start gap-3">
              {/* Ponto de interrogação em verde vibrante */}
              <span className="text-green-500 font-bold">?</span>
              {item.question}
            </h3>
            {/* Linha lateral verde */}
            <p className="text-text-secondary pl-6 border-l-2 border-green-200">
              {item.answer}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Dúvida não respondida - Tudo em tons de verde */}
      <div className="bg-green-50 rounded-xl p-8 text-center border border-green-200 max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-green-800 mb-2">Ainda tem dúvidas?</h3>
        <p className="text-green-700 mb-6">
          A nossa equipa está pronta para responder a qualquer outra questão.
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
        >
          <FaWhatsapp size={20} />
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
};

export default FAQPage;
