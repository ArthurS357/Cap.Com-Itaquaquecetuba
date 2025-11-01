import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import SearchBar from './SearchBar';

type LayoutProps = {
  children: React.ReactNode;
};

const Navbar = () => (
  <header className="bg-surface-card/80 backdrop-blur-sm sticky top-0 z-30 border-b border-surface-border">
    <div className="container mx-auto p-4 flex flex-col md:flex-row justify-between items-center gap-4">
      
      {/* Logo */}
      <Link href="/">
        <Image
          src="/images/logo-capcom.png"
          alt="Logo da Cap.Com Itaquaquecetuba"
          width={140}
          height={140}
          priority
        />
      </Link>

      {/* Links de Navegação */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
          Início
        </Link>
        <Link href="/#categorias" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
          Categorias
        </Link>
        <Link href="/#servicos" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
          Serviços
        </Link>
        <Link href="/#localizacao" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">
          Localização
        </Link>
      </nav>

      {/* Barra de Busca */}
      <SearchBar />
    </div>
  </header>
);

// --- Componente Footer Corrigido ---
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const storeAddress = "Estr. dos Índios, 765 - Jardim Mossapyra, Itaquaquecetuba - SP, 08570-000";
  const phoneNumber = "(11) 99638-8426";
  
  // Mensagem padrão para o WhatsApp
  const defaultMessage = "Olá! Visitei o site e gostaria de mais informações.";

  // Formata o número e cria o link
  const whatsappNumberOnly = phoneNumber.replace(/\D/g, '');
  const fullWhatsappNumber = `55${whatsappNumberOnly}`;
  const whatsappLink = `https://wa.me/${fullWhatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <footer className="bg-surface-card border-t border-surface-border mt-16 py-8">
      <div className="container mx-auto px-4 text-center text-text-secondary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Navegação Rápida */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-brand-primary transition-colors">Início</Link></li>
              <li><Link href="/#categorias" className="hover:text-brand-primary transition-colors">Categorias</Link></li>
              <li><Link href="/#servicos" className="hover:text-brand-primary transition-colors">Serviços</Link></li>
              <li><Link href="/#localizacao" className="hover:text-brand-primary transition-colors">Localização</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Contato</h4>
            <p>Não encontrou o seu produto?</p>
            <p className="font-semibold text-text-primary mt-1">Fale conosco:</p>
            {/* O link inclui mensagem pronta */}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block text-lg text-brand-primary hover:text-brand-accent transition-colors my-2">
              {phoneNumber} (WhatsApp)
            </a>
          </div>

          {/* Endereço */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Onde Estamos</h4>
            <p>{storeAddress}</p>
            <Link href="/#localizacao" className="text-sm text-brand-primary hover:text-brand-accent transition-colors mt-2 inline-block">
              Ver no mapa
            </Link>
          </div>
        </div>

        {/* Direitos Autorais */}
        <div className="border-t border-surface-border pt-6 mt-8 text-sm text-text-subtle">
          <p>&copy; {currentYear} Cap.Com Itaquaquecetuba. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
// --- Fim do Componente Footer ---


export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-surface-background">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}