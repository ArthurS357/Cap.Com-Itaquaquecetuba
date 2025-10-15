import Link from 'next/link';
import Image from 'next/image';
import React from 'react';

type LayoutProps = {
  children: React.ReactNode;
};

const Navbar = () => (
  <header className="container mx-auto p-4 flex justify-center items-center border-b">
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
  </header>
);

const Footer = () => (
  <footer className="container mx-auto text-center mt-12 p-4 border-t">
    <p>Não encontrou o seu produto?</p>
    <p className="font-semibold">Entre em contato: (xx) xxxxx-xxxx</p>
  </footer>
);


export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-8">
        {children} {/* Aqui é onde o conteúdo da página será inserido */}
      </main>
      <Footer />
    </div>
  );
}