import db from "@/db/db";
import bcrypt from "bcryptjs";

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createAdmin(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "SUPER_ADMIN";
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Console log for testing
  console.log("🔐 ADMIN VERIFICATION CODE:");
  console.log(`📧 Email: ${data.email}`);
  console.log(`🔢 Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  console.log("=".repeat(50));

  return await db.admin.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "ADMIN",
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    },
  });
}

export async function getAdminByEmail(email: string) {
  return await db.admin.findUnique({
    where: { email },
  });
}

export async function verifyAdmin(email: string, code: string) {
  const admin = await db.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return { success: false, error: "Admin not found" };
  }

  if (admin.isVerified) {
    return { success: false, error: "Admin already verified" };
  }

  if (!admin.verificationCode || !admin.verificationCodeExpires) {
    return { success: false, error: "No verification code found" };
  }

  if (new Date() > admin.verificationCodeExpires) {
    return { success: false, error: "Verification code expired" };
  }

  if (admin.verificationCode !== code) {
    console.log(`❌ VERIFICATION FAILED:`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 Entered: ${code}`);
    console.log(`✅ Expected: ${admin.verificationCode}`);
    console.log("=".repeat(50));
    return { success: false, error: "Invalid verification code" };
  }

  // Verify the admin
  await db.admin.update({
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
  const admin = await db.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return { success: false, error: "Admin not found" };
  }

  if (admin.isVerified) {
    return { success: false, error: "Admin already verified" };
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.admin.update({
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
