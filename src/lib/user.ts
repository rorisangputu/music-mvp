import db from "@/db/db";
import bcrypt from "bcryptjs";
import { createTransport } from "nodemailer";
//import { Resend } from "resend";


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

const transport = createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Send verification email
async function sendVerificationEmail(
  email: string,
  code: string,
  name: string
) {
  try {
    const mail = await transport.sendMail({
      from: process.env.MAILTRAP_FROM!, // e.g., 'noreply@yourdomain.com'
      to: [email],
      subject: "Verify Your Account",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Verify Your Account</h1>
          </div>

          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 15px;">Hello ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for signing up! Please use the verification code below to complete your account setup:
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 6px; letter-spacing: 2px;">
                ${code}
              </span>
            </div>

            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              This code will expire in 24 hours for your security.
            </p>

            <p style="color: #666; line-height: 1.6;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>

          <div style="text-align: center; color: #888; font-size: 14px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
      text: `
        Hello ${name}!

        Thank you for signing up! Please use the verification code below to complete your account setup:

        Verification Code: ${code}

        This code will expire in 24 hours for your security.

        If you didn't create an account, you can safely ignore this email.
      `,
    });

    if (mail.rejected && mail.rejected.length > 0) {
      console.error("❌ Email sending failed:", mail.messageId);
      return { success: false, error: "Email did not send."};
    }

    console.log("✅ Verification email sent successfully:", mail.messageId);
    return { success: true, emailId: mail.messageId };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return { success: false, error: "Failed to send verification email" };
  }
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
  const emailResult = await sendVerificationEmail(
    data.email,
    verificationCode,
    data.name
  );

  if (!emailResult.success) {
    // Log error but don't fail user creation
    console.error(
      "⚠️ User created but email failed to send:",
      emailResult.error
    );
  }

  // Console log for testing/backup
  console.log("🔐 USER VERIFICATION CODE:");
  console.log(`📧 Email: ${data.email}`);
  console.log(`🔢 Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  console.log(`📬 Email sent: ${emailResult.success ? "✅" : "❌"}`);
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
      emailVerified: true,
      emailVerifiedDate: new Date(),
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
  const emailResult = await sendVerificationEmail(
    email,
    verificationCode,
    user.name
  );

  if (!emailResult.success) {
    console.error(
      "⚠️ Code generated but email failed to send:",
      emailResult.error
    );
    // Still return success since the code was updated in DB
  }

  // Console log for testing
  console.log("🔄 RESEND VERIFICATION CODE:");
  console.log(`📧 Email: ${email}`);
  console.log(`🔢 New Code: ${verificationCode}`);
  console.log(`⏰ Expires: ${verificationCodeExpires}`);
  console.log(`📬 Email sent: ${emailResult.success ? "✅" : "❌"}`);
  console.log("=".repeat(50));

  return { success: true, verificationCode };
}

// Add this to your email utilities file

// Send permanent sign-in link email for radio stations
async function sendSignInLinkEmail(
  email: string,
  stationName: string,
  signInUrl: string
) {
  try {
    const mail = await transport.sendMail({
      from: process.env.MAILTRAP_FROM!, // e.g., 'noreply@yourdomain.com'
      to: [email],
      subject: `Welcome ${stationName} - Your Permanent Sign-In Link`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎙️ Welcome to CMMG Music</h1>
          </div>

          <!-- Main Content -->
          <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 15px; font-size: 24px;">Hello ${stationName}!</h2>
            
            <p style="color: #666; line-height: 1.8; margin-bottom: 25px; font-size: 16px;">
              Thank you for registering! Your account has been created successfully. 
              Below is your <strong>permanent sign-in link</strong> that you can use anytime to access the platform.
            </p>

            <!-- Sign-In Link Button -->
            <div style="text-align: center; margin: 35px 0;">
              <a href="${signInUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); 
                        color: white; text-decoration: none; padding: 16px 40px; 
                        border-radius: 8px; font-weight: bold; font-size: 18px; 
                        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                        transition: transform 0.2s;">
                🔐 Access Your Account
              </a>
            </div>

            <!-- Important Info Box -->
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 6px; margin: 30px 0;">
              <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 16px;">📌 Important Information</h3>
              <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Bookmark this link</strong> for easy access in the future</li>
                <li>This link is <strong>permanent</strong> and won't expire</li>
                <li>Keep this link <strong>secure</strong> - anyone with it can access your account</li>
                <li>You can use this link from any device or browser</li>
              </ul>
            </div>

            <!-- Direct Link (for copying) -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 25px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px; font-weight: bold;">Your Sign-In Link:</p>
              <p style="color: #007bff; margin: 0; word-break: break-all; font-family: monospace; font-size: 13px;">
                ${signInUrl}
              </p>
            </div>

            <p style="color: #666; line-height: 1.8; margin-top: 30px; font-size: 15px;">
              If you have any questions or need assistance, please don't hesitate to reach out to our support team.
            </p>

            <p style="color: #666; line-height: 1.8; margin-top: 20px; font-size: 15px;">
              Best regards,<br>
              <strong>The CMMG Music Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 20px; color: #888; font-size: 13px;">
            <p style="margin: 5px 0;">This is an automated message, please do not reply to this email.</p>
            <p style="margin: 5px 0;">If you didn't register for this account, please contact our support team immediately.</p>
          </div>
        </div>
      `,
      text: `
        🎙️ Welcome to CMMG Music

        Hello ${stationName}!

        Thank you for registering! Your account has been created successfully.

        Your Permanent Sign-In Link:
        ${signInUrl}

        IMPORTANT INFORMATION:
        - Bookmark this link for easy access in the future
        - This link is permanent and won't expire
        - Keep this link secure - anyone with it can access your account
        - You can use this link from any device or browser

        If you have any questions or need assistance, please don't hesitate to reach out to our support team.

        Best regards,
        The CMMG Music Team
        Cell: 061-548-6843

        ---
        This is an automated message, please do not reply to this email.
        If you didn't register for this account, please contact our support team immediately.
        info@cmmg.co.za
      `,
    });

    if (mail.rejected && mail.rejected.length > 0) {
      console.error("❌ Sign-in link email sending failed:", mail.messageId);
      return { success: false, error: "Email did not send." };
    }

    console.log("✅ Sign-in link email sent successfully:", mail.messageId);
    return { success: true, emailId: mail.messageId };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return { success: false, error: "Failed to send sign-in link email" };
  }
}

export { sendSignInLinkEmail };