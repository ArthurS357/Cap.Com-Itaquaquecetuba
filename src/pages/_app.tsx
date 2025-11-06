import '@/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react'; 
import WelcomeSplash from '@/components/WelcomeSplash'; 
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define um timer para remover a tela de splash
    // Tempo reduzido para 700ms para carregamento mais rápido
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700); // 0.7 segundos

    return () => clearTimeout(timer);
  }, []); // O array vazio [] garante que isso rode apenas uma vez 

  if (isLoading) {
    return <WelcomeSplash />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}