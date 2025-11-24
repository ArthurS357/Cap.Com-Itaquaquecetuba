import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { FaBars, FaTimes } from 'react-icons/fa'; // Ícones para o menu mobile

// Importação dos componentes existentes
import ThemeToggleButton from './ThemeToggleButton';
import WhatsAppButton from './WhatsAppButton';
import Breadcrumbs from './Breadcrumbs';
import PromoBanner from './PromoBanner';
import SearchBar from './SearchBar'; // Importando a barra de busca
import { STORE_INFO, getWhatsappLink } from '@/config/store';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

type LayoutProps = {
  children: React.ReactNode;
};

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Controle de scroll para esconder/mostrar navbar
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
          setIsMobileMenuOpen(false); // Fecha menu mobile ao rolar para baixo
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <header
      className={`
        bg-surface-card/95 backdrop-blur-sm 
        sticky top-0 z-40 border-b border-surface-border 
        transition-transform duration-300 ease-in-out shadow-sm
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      {/* Container Principal */}
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        {/* 1. LOGO (Esquerda) */}
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/images/logo-capcom.png"
              alt={`Logo da ${STORE_INFO.name}`}
              width={120} // Aumentei um pouco para melhor visibilidade
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* 2. BARRA DE BUSCA E NAV (Centro - Desktop) */}
        <div className="hidden md:flex flex-1 items-center justify-center px-8 gap-6">
          {/* Barra de busca centralizada no desktop */}
          <div className="w-full max-w-md">
            <SearchBar />
          </div>
          
          {/* Links de navegação ao lado ou abaixo dependendo do espaço */}
          <nav className="flex items-center gap-5 whitespace-nowrap">
            <Link href="/" className="text-text-secondary hover:text-brand-primary font-medium text-sm">Início</Link>
            <Link href="/#categorias" className="text-text-secondary hover:text-brand-primary font-medium text-sm">Categorias</Link>
            <Link href="/#servicos" className="text-text-secondary hover:text-brand-primary font-medium text-sm">Serviços</Link>
            <Link href="/#localizacao" className="text-text-secondary hover:text-brand-primary font-medium text-sm">Localização</Link>
          </nav>
        </div>

        {/* 3. AÇÕES (Direita: Tema + Menu Mobile) */}
        <div className="flex items-center gap-3">
          <ThemeToggleButton />

          {/* Botão Menu Hambúrguer (Apenas Mobile) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-brand-primary hover:bg-surface-border rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* === MENU MOBILE (Dropdown) === */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-surface-card absolute w-full left-0 shadow-lg animate-fade-in-down">
          <div className="p-4 flex flex-col gap-4">
            {/* Busca no Mobile */}
            <div className="mb-2">
              <SearchBar />
            </div>
            
            <nav className="flex flex-col gap-2">
              <Link 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-surface-border text-text-primary font-medium transition-colors"
              >
                Início
              </Link>
              <Link 
                href="/#categorias" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-surface-border text-text-primary font-medium transition-colors"
              >
                Categorias
              </Link>
              <Link 
                href="/#servicos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-surface-border text-text-primary font-medium transition-colors"
              >
                Serviços
              </Link>
              <Link 
                href="/#localizacao" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-lg hover:bg-surface-border text-text-primary font-medium transition-colors"
              >
                Localização
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

// --- Footer  ---
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const whatsappLink = getWhatsappLink();

  return (
    <footer className="bg-surface-card border-t border-surface-border mt-16 py-8">
      <div className="container mx-auto px-4 text-center text-text-secondary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
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
    <div className={`${inter.variable} min-h-screen flex flex-col font-sans bg-surface-background transition-colors duration-300`}>
      <PromoBanner />
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Breadcrumbs />
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
