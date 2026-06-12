import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { env, features } from "@/lib/env";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Providers are assembled from whichever secrets exist, so a bare local
 * setup still gets email/password while production lights up OAuth + magic
 * links just by adding env vars.
 */
const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash || user.deletedAt) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

if (features.oauth.google) {
  providers.push(
    Google({ clientId: env.GOOGLE_CLIENT_ID!, clientSecret: env.GOOGLE_CLIENT_SECRET! })
  );
}
if (features.oauth.github) {
  providers.push(
    GitHub({ clientId: env.GITHUB_CLIENT_ID!, clientSecret: env.GITHUB_CLIENT_SECRET! })
  );
}
if (features.oauth.microsoft) {
  providers.push(
    MicrosoftEntraID({
      clientId: env.MICROSOFT_ENTRA_ID_CLIENT_ID!,
      clientSecret: env.MICROSOFT_ENTRA_ID_CLIENT_SECRET!,
      issuer: env.MICROSOFT_ENTRA_ID_ISSUER,
    })
  );
}
if (features.resend) {
  providers.push(Resend({ apiKey: env.RESEND_API_KEY!, from: env.EMAIL_FROM }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials provider requires JWT sessions
  session: { strategy: "jwt" },
  secret: env.AUTH_SECRET,
  // Required for self-hosted deployments (next start outside Vercel);
  // the host is validated against NEXT_PUBLIC_APP_URL by the platform proxy.
  trustHost: true,
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
