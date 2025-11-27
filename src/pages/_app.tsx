import '@/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import WelcomeSplash from '@/components/WelcomeSplash';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from "next-auth/react"; 
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/context/CartContext'; 
import CartSidebar from '@/components/CartSidebar';   

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('has_visited_capcom');

    if (hasVisited) {
      setShowSplash(false);
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        localStorage.setItem('has_visited_capcom', 'true');
      }, 2500); 

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <SessionProvider session={session}>
      {/* Envolve a aplicação com o CartProvider para o estado ser global */}
      <CartProvider>
        
        {showSplash && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-background">
             <WelcomeSplash />
          </div>
        )}

        <ThemeProvider attribute="class" defaultTheme="system">
          <Layout>
            <Component {...pageProps} />
            <Toaster position="top-center" reverseOrder={false} />
            {/* O componente visual do carrinho fica disponível em todas as páginas */}
            <CartSidebar /> 
          </Layout>
        </ThemeProvider>

      </CartProvider>
    </SessionProvider>
  );
}
