// app/api/admin/client-tokens/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import crypto from "crypto";
import { auth } from "@/lib/auth";

// GET - List all client accounts with tokens
export async function GET() {
  try {
    const session = await auth();

    if (!session || (session.user as any).type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await db.user.findMany({
      where: {
        isRadioStation: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        isRadioStation: true,
        signInToken: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            loginHistory: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const clientsWithUrls = clients.map((client) => ({
      ...client,
      signInUrl: client.signInToken
        ? `${baseUrl}/api/auth/token-signin?token=${client.signInToken}`
        : null,
    }));

    return NextResponse.json(clientsWithUrls);
  } catch (error) {
    console.error("Error fetching client tokens:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Generate new token for a client
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any).type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    const user = await db.user.update({
      where: { id: userId },
      data: {
        signInToken: newToken,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const signInUrl = `${baseUrl}/api/auth/token-signin?token=${newToken}`;

    return NextResponse.json({
      userId: user.id,
      signInUrl,
      message: "Token regenerated successfully",
    });
  } catch (error) {
    console.error("Error regenerating token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke a client's token
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any).type !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await db.user.update({
      where: { id: userId },
      data: {
        signInToken: null,
        isActive: false,
      },
    });

    return NextResponse.json({
      message: "Token revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking token:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}