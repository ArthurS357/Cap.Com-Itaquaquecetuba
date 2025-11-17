import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumbs = () => {
  const router = useRouter();
  
  // Não mostrar na Home (página inicial)
  if (router.pathname === '/') return null;

  // Divide a URL em partes (ex: /servicos/manutencao -> ['servicos', 'manutencao'])
  const pathSegments = router.asPath.split('/').filter((segment) => segment);

  // Mapa de traduções para deixar os nomes bonitos
  const nameMap: Record<string, string> = {
    'servicos': 'Serviços',
    'manutencao': 'Manutenção',
    'remanufatura': 'Remanufatura',
    'faq': 'Perguntas Frequentes',
    'categoria': 'Categoria',
    'produto': 'Produto',
    'busca': 'Busca',
    'impressoras': 'Impressoras'
  };

  return (
    <nav className="text-sm text-text-subtle mb-6 animate-fade-in-up">
      <ul className="flex items-center flex-wrap gap-2">
        {/* Link para Home */}
        <li>
          <Link href="/" className="hover:text-brand-primary transition-colors flex items-center gap-1">
            <FaHome /> Início
          </Link>
        </li>

        {/* Gerar links para cada parte do caminho */}
        {pathSegments.map((segment, index) => {
          // Reconstrói o link (ex: /servicos/manutencao)
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          
          // Formata o nome: remove queries (?), usa o mapa ou capitaliza
          const cleanSegment = segment.split('?')[0];
          const name = nameMap[cleanSegment] || decodeURIComponent(cleanSegment.replace(/-/g, ' '));
          
          const isLast = index === pathSegments.length - 1;

          return (
            <li key={href} className="flex items-center gap-2">
              <FaChevronRight className="text-xs opacity-50" />
              {isLast ? (
                <span className="font-medium text-text-primary capitalize truncate max-w-[200px]">
                  {name}
                </span>
              ) : (
                <Link href={href} className="hover:text-brand-primary transition-colors capitalize">
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
