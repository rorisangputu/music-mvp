import db from "@/db/db";
import bcrypt from "bcryptjs";

/**
 * Generate a 6-digit numeric verification code.
 * Used for verifying new admin accounts.
 *
 * @returns {string} A random 6-digit code as a string.
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a new admin account in the database.
 *
 * @param {Object} data - The admin details.
 * @param {string} data.name - The full name of the admin.
 * @param {string} data.email - The admin's email (must be unique).
 * @param {string} data.password - The raw password (will be hashed before storing).
 * @param {"ADMIN" | "SUPER_ADMIN"} [data.role] - Optional role (default is "ADMIN").
 *
 * @returns {Promise<Object>} The newly created admin record from the database.
 */
export async function createAdmin(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "SUPER_ADMIN";
}) {
  // Hash password with bcrypt (12 salt rounds for security)
  const hashedPassword = await bcrypt.hash(data.password, 12);

  // Generate verification details
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

  // Debug log (for development/testing only)
  console.log("🔐 ADMIN VERIFICATION CODE:");
  console.log(`📧 Email: ${data.email}`);
  console.log(`🔢 Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  console.log("=".repeat(50));

  // Save admin record in DB
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

/**
 * Fetch an admin by their email.
 *
 * @param {string} email - The email address of the admin.
 * @returns {Promise<Object|null>} The admin record or null if not found.
 */
export async function getAdminByEmail(email: string) {
  return await db.admin.findUnique({
    where: { email },
  });
}

/**
 * Verify an admin using their email and verification code.
 *
 * @param {string} email - The admin's email address.
 * @param {string} code - The verification code provided by the admin.
 *
 * @returns {Promise<{success: boolean, error?: string}>}
 * - success: true if verified successfully.
 * - error: message explaining why verification failed.
 */
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

  // Check expiration
  if (new Date() > admin.verificationCodeExpires) {
    return { success: false, error: "Verification code expired" };
  }

  // Check if code matches
  if (admin.verificationCode !== code) {
    console.log(`❌ VERIFICATION FAILED:`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 Entered: ${code}`);
    console.log(`✅ Expected: ${admin.verificationCode}`);
    console.log("=".repeat(50));
    return { success: false, error: "Invalid verification code" };
  }

  // Update admin as verified
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

/**
 * Resend a new verification code to an unverified admin.
 *
 * @param {string} email - The admin's email.
 *
 * @returns {Promise<{success: boolean, error?: string, verificationCode?: string}>}
 * - success: true if code was resent.
 * - error: message if resend failed.
 * - verificationCode: the newly generated code (for testing).
 */
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

  // Generate new code and expiry
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Update admin record
  await db.admin.update({
    where: { email },
    data: {
      verificationCode,
      verificationCodeExpires,
    },
  });

  // Debug log
  console.log("🔄 RESEND VERIFICATION CODE:");
  console.log(`📧 Email: ${email}`);
  console.log(`🔢 New Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  console.log("=".repeat(50));

  return { success: true, verificationCode };
}
