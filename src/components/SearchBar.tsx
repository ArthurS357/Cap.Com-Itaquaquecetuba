import { useState, type FormEvent } from 'react'; 
import { useRouter } from 'next/router';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Removemos 'React.' e usamos apenas 'FormEvent'
  const handleSearch = (e: FormEvent) => { 
    e.preventDefault();
    if (query.trim()) {
      router.push(`/busca?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por produto, marca ou impressora..."
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