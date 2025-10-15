// app/api/register/radio/route.ts
import { NextRequest, NextResponse } from "next/server";
import db from "@/db/db";
import crypto from "crypto";
import { getUserByEmail, sendSignInLinkEmail } from "@/lib/user";


// Generate a cryptographically secure random token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationName, email } = body;

    // Validation
    if (!stationName || !email) {
      return NextResponse.json(
        { error: "Station name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Trim inputs
    const trimmedStationName = stationName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existingUser = await getUserByEmail(trimmedEmail);

    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered. Please use a different email or contact support." },
        { status: 409 }
      );
    }

    // Generate unique token
    const signInToken = generateSecureToken();

    // Create user account
    const user = await db.user.create({
      data: {
        name: trimmedStationName,
        email: trimmedEmail,
        password: null, // No password for token-based auth
        signInToken,
        isRadioStation: true,
        isActive: true,
        isVerified: true, // Radio stations are auto-verified
        role: "USER",
      },
    });

    // Generate sign-in URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const signInUrl = `${baseUrl}/api/auth/token-signin?token=${signInToken}`;

    // Send email with sign-in link
    const emailResult = await sendSignInLinkEmail(
      trimmedEmail,
      trimmedStationName,
      signInUrl
    );

    if (!emailResult.success) {
      // Email failed, but user was created - log error
      console.error("❌ Failed to send email to:", trimmedEmail);
      console.error("Error:", emailResult.error);
      
      // Still return success since account was created
      // Admin can regenerate and resend from dashboard
      return NextResponse.json({
        success: true,
        message: "Account created but email failed to send. Please contact support for your sign-in link.",
        userId: user.id,
        warning: "Email delivery failed",
      }, { status: 201 });
    }

    console.log(`✅ Radio station registered: ${trimmedStationName} (${trimmedEmail})`);
    console.log(`📧 Sign-in email sent with ID: ${emailResult.emailId}`);

    return NextResponse.json({
      success: true,
      message: "Registration successful! Check your email for the sign-in link.",
      userId: user.id,
    }, { status: 201 });
    
  } catch (error) {
    console.error("❌ Radio registration error:", error);
    
    // More specific error handling
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    
    return NextResponse.json(
      { error: "Registration failed. Please try again or contact support." },
      { status: 500 }
    );
  }
}