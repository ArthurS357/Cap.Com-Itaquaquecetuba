import { useState } from 'react';
import { useRouter } from 'next/router';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navega para a página de busca com o termo pesquisado como query param 'q'
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por produto ou impressora..."
        className="w-full px-4 py-2 border border-surface-border rounded-lg
                   bg-surface-card
                   text-text-primary
                   placeholder-text-secondary
                   focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent" 
      />
    </form>
  );
};

export default SearchBar;
