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
          background: '#121212', // Fundo principal escuro
          card: '#1E1E1E',       // Fundo dos cards escuro
          border: '#2C2C2C',    // Cor sutil para bordas no tema escuro
        },
        text: {
          primary: '#E0E0E0',    // Texto principal claro
          secondary: '#A0A0A0',  // Texto secundário
          subtle: '#707070',     // Texto de apoio
        },
      },
    },
  },
  plugins: [],
};
export default config;
