import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
};

const Navbar = () => (
  <header className="bg-surface-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-surface-border">
    <div className="container mx-auto p-4 flex justify-center items-center">
    <Link href="/">
      <Image
        src="/logo-capcom.png" 
        alt="Logo da Cap.Com Itaquaquecetuba"
        width={140}
        height={140}
        priority
      />
    </Link>
    {/* No futuro, podemos adicionar links de navegação aqui */}
    </div>
  </header>
);

const Footer = () => (
  <footer className="container mx-auto text-center mt-12 p-6 border-t border-surface-border">
    <p className="text-text-secondary">Não encontrou o seu produto?</p>
    <p className="font-semibold text-text-primary">Entre em contato: (xx) xxxxx-xxxx</p>
  </footer>
);


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