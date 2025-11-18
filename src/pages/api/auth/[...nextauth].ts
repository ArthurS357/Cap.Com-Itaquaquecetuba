import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Acesso Administrativo",
      credentials: {
        username: { label: "Usuário", type: "text", placeholder: "admin" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        // Verifica se o login e senha batem com o .env
        if (
          credentials?.username === process.env.ADMIN_USER &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          // Retorna o objeto do usuário se sucesso
          return { id: "1", name: "Admin Cap.Com", email: "admin@capcom.com" };
        }
        // Retorna null se falhar
        return null;
      }
    })
  ],
  pages: {
    // Vamos usar a página padrão por enquanto para testar rápido
    // signIn: '/auth/login', 
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);