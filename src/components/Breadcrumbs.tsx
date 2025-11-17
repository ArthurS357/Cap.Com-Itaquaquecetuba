import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaChevronRight, FaHome } from 'react-icons/fa';

const Breadcrumbs = () => {
  const router = useRouter();
  
  // Não mostrar na Home
  if (router.pathname === '/') return null;

  const pathSegments = router.asPath.split('/').filter((segment) => segment);

  // Mapa de nomes bonitos para exibição
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

  // --- NOVO: Mapa de Links Personalizados ---
  // Define para onde cada "pasta" deve apontar se for clicada
  const customLinks: Record<string, string> = {
    'servicos': '/#servicos',     // Leva para a seção de serviços na Home
    'produto': '/#categorias',    // Leva para a lista de categorias na Home
    'categoria': '/#categorias',  // Leva para a lista de categorias na Home
    'impressoras': '/#categorias' // Leva para a lista de categorias na Home
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

        {pathSegments.map((segment, index) => {
          const cleanSegment = segment.split('?')[0]; // Remove query params
          const isLast = index === pathSegments.length - 1;
          
          // Define o nome de exibição
          const name = nameMap[cleanSegment] || decodeURIComponent(cleanSegment.replace(/-/g, ' '));

          // --- LÓGICA CORRIGIDA DO LINK ---
          // 1. Se tiver um link personalizado no mapa, usa ele.
          // 2. Se não, constrói o caminho padrão acumulado.
          let href = customLinks[cleanSegment];
          
          if (!href) {
             href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          }

          return (
            <li key={`${cleanSegment}-${index}`} className="flex items-center gap-2">
              <FaChevronRight className="text-xs opacity-50" />
              
              {isLast ? (
                // O último item nunca é link, é apenas texto (página atual)
                <span className="font-medium text-text-primary capitalize truncate max-w-[200px]">
                  {name}
                </span>
              ) : (
                // Itens intermédios são links inteligentes
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
