import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggleButton = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Garante que o componente só renderize no cliente
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Renderiza um placeholder ou nada para evitar "hydration mismatch"
    return (
      <button 
        aria-label="Carregando tema"
        className="p-2 rounded-full bg-surface-border animate-pulse"
        disabled
      >
        <div className="w-5 h-5"></div>
      </button>
    );
  }

  const isDarkMode = theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      className="p-2 rounded-full text-text-secondary
                 hover:text-brand-primary hover:bg-surface-border 
                 transition-colors duration-200"
    >
      {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
    </button>
  );
};

export default ThemeToggleButton;