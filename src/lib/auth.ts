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
    // async signIn({ user, account, profile }) {
    //   // Handle OAuth sign in
    //   if (account?.provider === "google") {
    //     const existingUser = await db.user.findUnique({
    //       where: { email: user.email! },
    //     });

    //     if (existingUser) {
    //       // Update existing user to ensure they're active and verified
    //       await db.user.update({
    //         where: { email: user.email! },
    //         data: {
    //           isActive: true,
    //           isVerified: true, // OAuth users are considered verified
    //           name: user.name || existingUser.name,
    //           image: user.image,
    //           // Don't set role if it already exists
    //           ...(existingUser.role ? {} : { role: "USER" }),
    //         },
    //       });
    //     } else {
    //       // This case should be handled by the adapter, but just in case
    //       await db.user.create({
    //         data: {
    //           email: user.email!,
    //           name: user.name || "Google User",
    //           image: user.image,
    //           isActive: true,
    //           isVerified: true,
    //           role: "USER", // Set default role
    //         },
    //       });
    //     }
    //   }
    //   return true;
    // },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.type = (user as any).type || "user";
      }
      // If this is a Google sign in, get the user's role from the database
      // if (account?.provider === "google") {
      //   const dbUser = await db.user.findUnique({
      //     where: { email: token.email! },
      //   });
      //   if (dbUser) {
      //     token.role = dbUser.role;
      //     token.type = "user";
      //   }
      // }
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
  // events: {
  //   async createUser({ user }) {
  //     // Ensure newly created OAuth users have proper defaults
  //     if (user.email) {
  //       await db.user.update({
  //         where: { id: user.id },
  //         data: {
  //           isActive: true,
  //           isVerified: true,
  //           role: "USER",
  //         },
  //       });
  //     }
  //   },
  // },
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


