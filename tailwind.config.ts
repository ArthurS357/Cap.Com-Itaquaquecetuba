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
          accent: '#1d7dcf',    // Azul mais vibrante para acentos e hovers
          dark: '#003d73',     // Azul mais escuro para hover de botões primários
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
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-in-up': 'slideInUp 0.6s ease-out forwards',
        'slide-in-right': 'slideInRight 0.6s ease-out forwards',
        'fadeIn': 'fadeIn 1s ease-out forwards', 
        'fadeOut': 'fadeOut 0.5s ease-out forwards', 
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(50px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
           '0%': { opacity: '0', transform: 'translateX(-50px)' },
           '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: { 
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: { 
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
export default config;