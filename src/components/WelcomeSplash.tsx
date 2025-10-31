import Image from 'next/image';

const WelcomeSplash = () => {
  return (
    // Container principal (animação de fade-out)
    <div
      className="flex items-center justify-center min-h-screen bg-surface-background 
                 animate-fadeOut [animation-delay:2000ms] [animation-duration:500ms]"
    >
      {/* Container do conteúdo (animação de fade-in) */}
      <div className="flex flex-col items-center animate-fadeIn [animation-duration:1000ms] text-center px-4">
        
        {/* Logo */}
        <Image
          src="/images/logo-capcom.png"
          alt="Logo Cap.Com Itaquaquecetuba"
          width={200}
          height={200}
          priority 
        />
        
        {/* Título Estilizado (MODIFICADO) */}
        <h2 className="mt-6 text-4xl font-bold 
                       bg-gradient-to-r from-brand-accent to-brand-primary 
                       text-transparent bg-clip-text"
        >
          Bem-vindo!
        </h2>

        {/* Subtítulo (NOVO) */}
        <p className="mt-2 text-lg text-text-secondary">
          Sua solução completa em impressão.
        </p>
      </div>
    </div>
  );
};

export default WelcomeSplash;