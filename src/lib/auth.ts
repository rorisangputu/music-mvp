import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import db from "@/db/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginType: { label: "Login Type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        const loginType = credentials.loginType as string;

        if (loginType === "admin") {
          const admin = await db.admin.findUnique({
            where: { email },
          });

          if (
            admin &&
            admin.isActive &&
            admin.isVerified &&
            (await bcrypt.compare(password, admin.password))
          ) {
            return {
              id: admin.id,
              email: admin.email,
              name: admin.name,
              role: admin.role,
              type: "admin",
            };
          }
        }

        if (loginType === "user") {
          const user = await db.user.findUnique({
            where: { email },
          });

          if (
            user &&
            user.isActive &&
            user.isVerified &&
            (await bcrypt.compare(password, user.password!))
          ) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              type: "user",
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.type = (user as any).type || "user";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).type = token.type;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  cookies: {
    sessionToken: {
      name: "cmmg-music.session-token", // unique name for app 1
    },
  },
  session: {
    strategy: "jwt",
  },
});


