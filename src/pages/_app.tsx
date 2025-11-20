import '@/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react'; 
import WelcomeSplash from '@/components/WelcomeSplash'; 
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from "next-auth/react"; 
import "@uploadthing/react/styles.css";

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700); 

    return () => clearTimeout(timer);
  }, []); 

  if (isLoading) {
    return <WelcomeSplash />;
  }

  return (
    // Envolvendo tudo com o SessionProvider
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system">
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </SessionProvider>
  );
}