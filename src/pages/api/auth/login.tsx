import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import SEO from '@/components/Seo';
import { FaUser, FaLock, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Captura a URL de retorno caso o usuário tenha tentado acessar uma página restrita antes
    const callbackUrl = (router.query.callbackUrl as string) || '/admin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Chamada ao NextAuth
        const res = await signIn('credentials', {
            username: formData.username,
            password: formData.password,
            redirect: false, // Importante: Desliga o redirect automático para controlarmos abaixo
        });

        if (res?.error) {
            toast.error('Credenciais inválidas. Tente novamente.');
            setIsLoading(false);
        } else {
            toast.success('Login realizado com sucesso!');
            // Redireciona para o Painel Admin (ou para onde ele estava indo)
            router.push(callbackUrl);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-surface-background p-4 animate-fade-in-up">
            <SEO title="Login Administrativo" />

            <div className="w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-xl overflow-hidden">

                {/* Cabeçalho do Card */}
                <div className="bg-brand-primary p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-white p-3 rounded-full shadow-lg">
                            <Image
                                src="/images/logo-capcom.png"
                                alt="Cap.Com"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Acesso Restrito</h1>
                    <p className="text-brand-light text-sm mt-1">Gerenciamento Cap.Com</p>
                </div>

                {/* Formulário */}
                <div className="p-8 pt-10">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Usuário */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
                                <FaUser />
                            </div>
                            <input
                                type="text"
                                placeholder="Usuário"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>

                        {/* Senha */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-subtle">
                                <FaLock />
                            </div>
                            <input
                                type="password"
                                placeholder="Senha"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-surface-border bg-surface-background focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {/* Botão de Login */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-dark transition-all duration-300 shadow-md flex items-center justify-center gap-2 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Entrando...</span>
                            ) : (
                                <>
                                    Entrar no Painel <FaArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href="/"
                            className="text-sm text-text-subtle hover:text-brand-primary flex items-center justify-center gap-2 transition-colors"
                        >
                            <FaArrowLeft size={12} /> Voltar para a Loja
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}