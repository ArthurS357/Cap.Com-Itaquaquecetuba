import '@/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react'; 
import WelcomeSplash from '@/components/WelcomeSplash'; 

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define um timer para remover a tela de splash
    // 2000ms (delay) + 500ms (duration) = 2500ms
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 segundos

    return () => clearTimeout(timer);
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  if (isLoading) {
    return <WelcomeSplash />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}