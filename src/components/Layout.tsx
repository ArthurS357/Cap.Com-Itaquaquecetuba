import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import ThemeToggleButton from './ThemeToggleButton';
import WhatsAppButton from './WhatsAppButton';
import Breadcrumbs from './Breadcrumbs';
import PromoBanner from './PromoBanner';
import { Inter } from 'next/font/google';
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

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        // Lógica de esconder/mostrar menu ao rolar
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
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
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <div className="container mx-auto p-4 flex flex-row flex-wrap md:flex-nowrap justify-between items-center gap-4">
        <Link href="/">
          <Image
            src="/images/logo-capcom.png"
            alt={`Logo da ${STORE_INFO.name}`}
            width={100}
            height={100}
            className="h-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Início</Link>
          <Link href="/#categorias" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Categorias</Link>
          <Link href="/#servicos" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Serviços</Link>
          <Link href="/#localizacao" className="text-text-secondary hover:text-brand-primary transition-colors font-medium">Localização</Link>
        </nav>

        <div className="flex items-center gap-4 w-full md:w-auto basis-full md:basis-auto justify-end">
          <ThemeToggleButton />
        </div>
      </div>
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
      {/* Banner inserido aqui, antes do Navbar */}
      <PromoBanner />
      <Navbar />

      {/* Ajustado o padding-top para não ter buraco grande */}
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <Breadcrumbs />
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
