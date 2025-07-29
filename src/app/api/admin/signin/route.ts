import { NextRequest, NextResponse } from "next/server";
import { getAdminByEmail } from "@/lib/admin";
import bcrypt from "bcryptjs";
import { signIn } from "@/lib/auth";

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
    const admin = await getAdminByEmail(email);

    if (!admin) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 401 }
      );
    }

    if (!admin.isVerified) {
      return NextResponse.json(
        {
          error: "Please verify your account first",
          redirectTo: `/admin/verify?email=${encodeURIComponent(email)}`,
        },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, admin.password);

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
      loginType: "admin",
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
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🎭 Role: ${admin.role}`);
    console.log("=".repeat(50));

    return NextResponse.json(
      {
        success: "Sign in successful",
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
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
