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
import { WishlistProvider } from '@/context/WishlistContext';
import Script from 'next/script'; 

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [showSplash, setShowSplash] = useState(true);

  // Lógica da Tela de Boas-vindas (Splash Screen)
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
      <WishlistProvider>
        <CartProvider>
          
          {/* --- GOOGLE ANALYTICS --- */}
          {process.env.NEXT_PUBLIC_GA_ID && (
            <>
              <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `}
              </Script>
            </>
          )}
          {/* ------------------------ */}

          {showSplash && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-background">
               <WelcomeSplash />
            </div>
          )}

          <ThemeProvider attribute="class" defaultTheme="system">
            <Layout>
              <Component {...pageProps} />
              <Toaster position="top-center" reverseOrder={false} />
              {/* O Carrinho Lateral fica disponível globalmente */}
              <CartSidebar /> 
            </Layout>
          </ThemeProvider>

        </CartProvider>
      </WishlistProvider>
    </SessionProvider>
  );
}