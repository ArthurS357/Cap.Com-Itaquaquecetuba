import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Define 'Inter' como a fonte padrão
      },
      colors: {
        brand: {
          primary: '#00529B', // Um azul corporativo
          light: '#E6F0F9',   // Um tom de azul bem claro para fundos
        },
        surface: {
          background: '#F8F9FA', // Um cinza muito claro para o fundo do site
          card: '#FFFFFF',       // Branco para os cards
        },
      },
    },
  },
  plugins: [],
};
export default config;