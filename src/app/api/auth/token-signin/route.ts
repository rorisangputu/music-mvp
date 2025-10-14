// app/api/auth/token-signin/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import { encode } from "next-auth/jwt";

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      throw new Error("NEXTAUTH_SECRET is not defined");
    }

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/auth/error?error=InvalidToken", request.url));
    }

    // Find user with this token
    const user = await db.user.findUnique({
      where: { signInToken: token },
    });

    if (!user || !user.isActive) {
      return NextResponse.redirect(new URL("/auth/error?error=InvalidToken", request.url));
    }

    // Log login history
    await db.loginHistory.create({
      data: {
        userId: user.id,
        clientType: user.clientType,
        loginMethod: "token",
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    // Encode a NextAuth JWT token using the same cookie name as salt
    const jwt = await encode({
      secret: secret,
      salt: "cmmg-music.session-token", // Must match your NextAuth cookie name
      token: {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        type: "user",
      },
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Set JWT cookie with the same name as NextAuth config
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set({
      name: "cmmg-music.session-token",
      value: jwt,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Token sign-in error:", error);
    return NextResponse.redirect(
      new URL("/auth/error?error=Configuration", request.url)
    );
  }
}