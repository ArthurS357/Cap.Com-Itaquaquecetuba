import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login", // Para onde o NextAuth manda quem não está logado
  },
});

export const config = {
  // O matcher define em quais rotas esse middleware vai rodar.
  // O ":path*" é um "coringa", ou seja, protege /admin, /admin/products, /admin/settings...
  matcher: ["/admin/:path*"],
};