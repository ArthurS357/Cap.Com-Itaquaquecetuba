import '@/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import WelcomeSplash from '@/components/WelcomeSplash';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from "next-auth/react"; 
import "@uploadthing/react/styles.css";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  // Começa true para garantir que a primeira impressão visual seja a Splash (se necessário)
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Verifica no armazenamento local do navegador se o usuário já visitou
    const hasVisited = localStorage.getItem('has_visited_capcom');

    if (hasVisited) {
      // Se já visitou, esconde a splash imediatamente
      setShowSplash(false);
    } else {
      // Se é a primeira visita, mantém a splash pelo tempo da animação (ex: 2.5s)
      // e depois marca como visitado
      const timer = setTimeout(() => {
        setShowSplash(false);
        localStorage.setItem('has_visited_capcom', 'true');
      }, 2500); 

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <SessionProvider session={session}>
      {/* Renderiza a Splash como um Overlay (camada por cima).
        Isso permite que o conteúdo principal (SEO) seja carregado ao fundo,
        mas o usuário vê a animação primeiro.
      */}
      {showSplash && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-surface-background">
           <WelcomeSplash />
        </div>
      )}

      <ThemeProvider attribute="class" defaultTheme="system">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
}