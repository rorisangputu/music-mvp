import db from "@/db/db";
import bcrypt from "bcryptjs";

export async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
  });
}

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "USER";
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Console log for testing
  console.log("🔐 ADMIN VERIFICATION CODE:");
  console.log(`📧 Email: ${data.email}`);
  console.log(`🔢 Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  console.log("=".repeat(50));

  return await db.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "USER",
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    },
  });
}

export async function verifyUser(email: string, code: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.isVerified) {
    return { success: false, error: "User already verified" };
  }

  if (!user.verificationCode || !user.verificationCodeExpires) {
    return { success: false, error: "No verification code found" };
  }

  if (new Date() > user.verificationCodeExpires) {
    return { success: false, error: "Verification code expired" };
  }

  if (user.verificationCode !== code) {
    console.log(`❌ VERIFICATION FAILED:`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 Entered: ${code}`);
    console.log(`✅ Expected: ${user.verificationCode}`);
    console.log("=".repeat(50));
    return { success: false, error: "Invalid verification code" };
  }

  // Verify the admin
  await db.user.update({
    where: { email },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    },
  });

  console.log(`✅ ADMIN VERIFIED SUCCESSFULLY:`);
  console.log(`📧 Email: ${email}`);
  console.log("=".repeat(50));

  return { success: true };
}

export async function resendVerificationCode(email: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  if (user.isVerified) {
    return { success: false, error: "User already verified" };
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.user.update({
    where: { email },
    data: {
      verificationCode,
      verificationCodeExpires,
    },
  });

  // Console log for testing
  console.log("🔄 RESEND VERIFICATION CODE:");
  console.log(`📧 Email: ${email}`);
  console.log(`🔢 New Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  console.log("=".repeat(50));

  return { success: true, verificationCode };
}
