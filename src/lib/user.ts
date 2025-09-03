import db from "@/db/db";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

// Initialize Resend with your API key
//const resend = new Resend(process.env.RESEND_API_KEY);

export async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
  });
}

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send verification email
// async function sendVerificationEmail(
//   email: string,
//   code: string,
//   name: string
// ) {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: process.env.RESEND_FROM_EMAIL!, // e.g., 'noreply@yourdomain.com'
//       to: [email],
//       subject: "Verify Your Account",
//       html: `
//         <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
//           <div style="text-align: center; margin-bottom: 30px;">
//             <h1 style="color: #333; margin-bottom: 10px;">Verify Your Account</h1>
//           </div>

//           <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
//             <h2 style="color: #333; margin-bottom: 15px;">Hello ${name}!</h2>
//             <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
//               Thank you for signing up! Please use the verification code below to complete your account setup:
//             </p>

//             <div style="text-align: center; margin: 30px 0;">
//               <span style="display: inline-block; background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 6px; letter-spacing: 2px;">
//                 ${code}
//               </span>
//             </div>

//             <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
//               This code will expire in 24 hours for your security.
//             </p>

//             <p style="color: #666; line-height: 1.6;">
//               If you didn't create an account, you can safely ignore this email.
//             </p>
//           </div>

//           <div style="text-align: center; color: #888; font-size: 14px;">
//             <p>This is an automated message, please do not reply to this email.</p>
//           </div>
//         </div>
//       `,
//       text: `
// Hello ${name}!

// Thank you for signing up! Please use the verification code below to complete your account setup:

// Verification Code: ${code}

// This code will expire in 24 hours for your security.

// If you didn't create an account, you can safely ignore this email.
//       `,
//     });

//     if (error) {
//       console.error("❌ Email sending failed:", error);
//       return { success: false, error: error.message };
//     }

//     console.log("✅ Verification email sent successfully:", data?.id);
//     return { success: true, emailId: data?.id };
//   } catch (error) {
//     console.error("❌ Email sending error:", error);
//     return { success: false, error: "Failed to send verification email" };
//   }
// }

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "USER";
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Create user in database
  const user = await db.user.create({
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

  // Send verification email
  // const emailResult = await sendVerificationEmail(
  //   data.email,
  //   verificationCode,
  //   data.name
  // );

  // if (!emailResult.success) {
  //   // Log error but don't fail user creation
  //   console.error(
  //     "⚠️ User created but email failed to send:",
  //     emailResult.error
  //   );
  // }

  // Console log for testing/backup
  console.log("🔐 USER VERIFICATION CODE:");
  console.log(`📧 Email: ${data.email}`);
  console.log(`🔢 Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  //console.log(`📬 Email sent: ${emailResult.success ? "✅" : "❌"}`);
  console.log("=".repeat(50));

  return user;
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

  // Verify the user
  await db.user.update({
    where: { email },
    data: {
      isVerified: true,
      verificationCode: null,
      verificationCodeExpires: null,
    },
  });

  console.log(`✅ USER VERIFIED SUCCESSFULLY:`);
  console.log(`📧 Email: ${email}`);
  console.log("=".repeat(50));

  return { success: true };
}

export async function resendVerificationCode(email: string) {
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user || !user.name) {
    return { success: false, error: "User not found" };
  }

  if (user.isVerified) {
    return { success: false, error: "User already verified" };
  }

  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Update user with new code
  await db.user.update({
    where: { email },
    data: {
      verificationCode,
      verificationCodeExpires,
    },
  });

  // Send new verification email
  // const emailResult = await sendVerificationEmail(
  //   email,
  //   verificationCode,
  //   user.name
  // );

  // if (!emailResult.success) {
  //   console.error(
  //     "⚠️ Code generated but email failed to send:",
  //     emailResult.error
  //   );
  //   // Still return success since the code was updated in DB
  // }

  // Console log for testing
  console.log("🔄 RESEND VERIFICATION CODE:");
  console.log(`📧 Email: ${email}`);
  console.log(`🔢 New Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  //console.log(`📬 Email sent: ${emailResult.success ? "✅" : "❌"}`);
  console.log("=".repeat(50));

  return { success: true, verificationCode };
}
