import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          primary: '#00529B',   // Azul principal
          dark: '#003d73',     // Azul mais escuro para hover
          light: '#E6F0F9',   // Azul bem claro para fundos de destaque
        },
        surface: {
          background: '#F8F9FA', // Fundo cinza claro (mantido)
          card: '#FFFFFF',       // Fundo dos cards
          border: '#E9ECEF',    // Cor sutil para bordas
        },
        text: {
          primary: '#212529',    // Preto/cinza escuro para textos principais
          secondary: '#495057',  // Cinza médio para textos secundários
          subtle: '#6C757D',     // Cinza claro para textos de apoio
        },
      },
    },
  },
  plugins: [],
};
export default config;