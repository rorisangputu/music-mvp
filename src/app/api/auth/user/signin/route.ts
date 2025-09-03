import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";
import { getUserByEmail } from "@/lib/user";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get admin
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: "Please verify your account first",
          redirectTo: `/verify?email=${encodeURIComponent(email)}`,
        },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: "Password not set for this account" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Sign in with NextAuth
    const result = await signIn("credentials", {
      email,
      password,
      loginType: "user",
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    console.log("✅ ADMIN SIGNIN SUCCESS:");
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`🎭 Role: ${user.role}`);
    console.log("=".repeat(50));

    return NextResponse.json(
      {
        success: "Sign in successful",
        admin: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        redirectTo: "/admin/dashboard",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin signin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
