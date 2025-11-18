import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react'; 
import ThemeToggleButton from './ThemeToggleButton';
import WhatsAppButton from './WhatsAppButton';
import Breadcrumbs from './Breadcrumbs';
import { Inter } from 'next/font/google';
import { STORE_INFO, getWhatsappLink } from '@/config/store';
import { FaBars, FaTimes } from 'react-icons/fa'; 
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

type LayoutProps = {
  children: React.ReactNode;
};

const Navbar = () => {
  // 1. Estados para Navbar (existente) e Menu Mobile (NOVO)
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;

        // Se rolar para baixo E passar de 100px (para não sumir logo no topo), esconde
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          // Se rolar para cima, mostra
          setIsVisible(true);
        }

        // Atualiza a última posição conhecida
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);

    // Limpeza do evento ao desmontar o componente
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);

  // Função para fechar o menu após um clique
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };
  // Funcao para alternar o estado do menu
  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header 
      className={`
        bg-surface-card/80 backdrop-blur-sm 
        fixed w-full top-0 z-30 border-b border-surface-border 
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="container mx-auto p-4 flex flex-row justify-between items-center gap-4"> 
        
        {/* Logo (Fica na esquerda) */}
        <Link href="/" onClick={handleLinkClick}>
          <Image
            src="/images/logo-capcom.png"
            alt={`Logo da ${STORE_INFO.name}`}
            width={100}
            height={100}
            className="h-auto"
            priority
          />
        </Link>

        {/* --- CONTROLES DA DIREITA (MODO ESCURO E MENU MOBILE) --- */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Botão de Modo Escuro/Claro (Fica na mesma linha, ao lado do menu) */}
          <ThemeToggleButton />

          {/* Botão do Menu Mobile (só visível em telas pequenas) */}
          <button 
            onClick={toggleMenu} 
            className="p-2 rounded-full text-text-secondary hover:text-brand-primary hover:bg-surface-border transition-colors duration-200 md:hidden"
            aria-label="Alternar Menu de Navegação"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          
          {/* Navegação Desktop (visível apenas em telas md+) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Início</Link>
            <Link href="/#categorias" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Categorias</Link>
            <Link href="/#servicos" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Serviços</Link>
            <Link href="/#localizacao" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Localização</Link>
          </nav>

        </div>
      </div>
      
      {/* --- MENU MOBILE (Aparece abaixo do cabeçalho, tela cheia) --- */}
      {isMobileMenuOpen && (
          <nav className="md:hidden w-full bg-surface-card border-t border-surface-border shadow-lg p-4 animate-fade-in-up">
            <ul className="flex flex-col space-y-3">
                <li><Link href="/" onClick={handleLinkClick} className="block text-text-primary font-medium hover:text-brand-primary transition-colors py-2">Início</Link></li>
                <li><Link href="/#categorias" onClick={handleLinkClick} className="block text-text-primary font-medium hover:text-brand-primary transition-colors py-2">Categorias</Link></li>
                <li><Link href="/#servicos" onClick={handleLinkClick} className="block text-text-primary font-medium hover:text-brand-primary transition-colors py-2">Serviços</Link></li>
                <li><Link href="/#localizacao" onClick={handleLinkClick} className="block text-text-primary font-medium hover:text-brand-primary transition-colors py-2">Localização</Link></li>
            </ul>
          </nav>
      )}

    </header>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const whatsappLink = getWhatsappLink();

  return (
    <footer className="bg-surface-card border-t border-surface-border mt-16 py-8">
      <div className="container mx-auto px-4 text-center text-text-secondary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Coluna de Navegação */}
          <div>
            <h4 className="font-semibold text-text-primary mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-brand-primary transition-colors">Início</Link></li>
              <li><Link href="/#categorias" className="hover:text-brand-primary transition-colors">Categorias</Link></li>
              <li><Link href="/#servicos" className="hover:text-brand-primary transition-colors">Serviços</Link></li>
              <li><Link href="/faq" className="hover:text-brand-primary transition-colors">Perguntas Frequentes</Link></li>
              <li><Link href="/#localizacao" className="hover:text-brand-primary transition-colors">Localização</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3">Contato</h4>
            <p>Não encontrou o seu produto?</p>
            <p className="font-semibold text-text-primary mt-1">Fale conosco:</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block text-lg text-brand-primary hover:text-brand-accent transition-colors my-2">
              {STORE_INFO.phoneDisplay} (WhatsApp)
            </a>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-3">Onde Estamos</h4>
            <p>{STORE_INFO.address}</p>
            <Link href="/#localizacao" className="text-sm text-brand-primary hover:text-brand-accent transition-colors mt-2 inline-block">
              Ver no mapa
            </Link>
          </div>
        </div>

        <div className="border-t border-surface-border pt-6 mt-8 text-sm text-text-subtle">
          <p>&copy; {currentYear} {STORE_INFO.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={`${inter.variable} min-h-screen flex flex-col font-sans bg-surface-background`}>
      <Navbar />
      {/* Padding-top (pt-28) aqui para compensar o header fixo e não cortar o conteúdo inicial */}
      <main className="flex-grow container mx-auto p-4 md:p-8 pt-28 md:pt-32">
        <Breadcrumbs />
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
