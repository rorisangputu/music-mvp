import { NextResponse, NextRequest } from "next/server";
import db from "@/db/db";
import { verifyCodeSchema } from "@/lib/validationSchemas";
import { resendVerificationCode, verifyUser } from "@/lib/user";

export async function POST(request: NextRequest) {
  try {
    const { email, code, action } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Handle resend verification code
    if (action === "resend") {
      const result = await resendVerificationCode(email);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json(
        { success: "Verification code resent successfully" },
        { status: 200 }
      );
    }

    // Handle verification
    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    const result = await verifyUser(email, code);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: "Admin account verified successfully. You can now sign in.",
        redirectTo: "/signin",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
