// src/pages/_app.tsx

import '../globals.css'; // Mude para este caminho relativo

import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}