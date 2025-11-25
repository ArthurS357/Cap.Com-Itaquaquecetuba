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
        if (
          credentials?.username === process.env.ADMIN_USER &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Admin Cap.Com", email: "admin@capcom.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/auth/login', // <--- ESTA LINHA É FUNDAMENTAL PARA EVITAR O 404
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);