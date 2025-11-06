import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggleButton = () => {
  const [mounted, setMounted] = useState(false);
  
  // Obter o 'resolvedTheme'
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
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

  // 'resolvedTheme' (em vez de 'theme') para decidir qual ícone mostrar
  const isDarkMode = resolvedTheme === 'dark';

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
