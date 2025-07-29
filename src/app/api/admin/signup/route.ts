import { NextRequest, NextResponse } from "next/server";
import { createAdmin, getAdminByEmail } from "@/lib/admin";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword } = await request.json();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if admin exists
    const existingAdmin = await getAdminByEmail(email);
    if (existingAdmin) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 409 }
      );
    }

    // Create admin
    const admin = await createAdmin({
      name,
      email,
      password,
      role: "ADMIN",
    });

    // TODO: Send confirmation email here
    // await sendConfirmationEmail(admin.email, admin.id)

    return NextResponse.json(
      {
        success:
          "Admin account created successfully. Please check your email to confirm your account.",
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
