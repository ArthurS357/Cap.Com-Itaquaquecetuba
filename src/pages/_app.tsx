import '@/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react'; 
import WelcomeSplash from '@/components/WelcomeSplash'; 

export default function App({ Component, pageProps }: AppProps) {
  // Estado para controlar a exibição do splash
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Define um timer para remover a tela de splash
    // O tempo deve ser a soma do delay + duração da animação de fadeOut
    // 2000ms (delay) + 500ms (duration) = 2500ms
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // 2.5 segundos

    // Limpa o timer se o componente for desmontado
    return () => clearTimeout(timer);
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // 1. Se 'isLoading' for true, mostre a tela de boas-vindas
  if (isLoading) {
    return <WelcomeSplash />;
  }

  // 2. Após 2.5s, 'isLoading' vira false, e o site normal é renderizado
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}