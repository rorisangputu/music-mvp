// scripts/generate-client-tokens.ts
// Run this with: npx tsx scripts/generate-client-tokens.ts

import db from "@/db/db";
import crypto from "crypto";



// Generate a cryptographically secure random token
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function createClientAccounts() {
  console.log("🚀 Creating client accounts with sign-in tokens...\n");

  const clients = [
    {
      name: "SABC Radio Stations",
      email: "sabc@radio-access.local",
      clientType: "SABC_RADIO",
    },
    {
      name: "Community Radio Stations",
      email: "community@radio-access.local",
      clientType: "COMMUNITY_RADIO",
    },
    {
      name: "Independent Radio Stations",
      email: "independent@radio-access.local",
      clientType: "INDEPENDENT_RADIO",
    },
  ];

  const results = [];

  for (const client of clients) {
    const token = generateSecureToken();

    try {
      // Check if user already exists
      const existing = await db.user.findUnique({
        where: { email: client.email },
      });

      let user;

      if (existing) {
        // Update existing user with new token
        user = await db.user.update({
          where: { email: client.email },
          data: {
            signInToken: token,
            clientType: client.clientType as any,
            isActive: true,
            isVerified: true,
          },
        });
        console.log(`✅ Updated existing user: ${client.name}`);
      } else {
        // Create new user
        user = await db.user.create({
          data: {
            name: client.name,
            email: client.email,
            password: null, // No password needed for token-based auth
            clientType: client.clientType as any,
            signInToken: token,
            isActive: true,
            isVerified: true,
            role: "USER",
          },
        });
        console.log(`✅ Created new user: ${client.name}`);
      }

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      const signInUrl = `${baseUrl}/api/auth/token-signin?token=${token}`;

      results.push({
        name: client.name,
        clientType: client.clientType,
        email: client.email,
        userId: user.id,
        signInUrl,
      });
    } catch (error) {
      console.error(`❌ Error creating ${client.name}:`, error);
    }
  }

  console.log("\n" + "=".repeat(80));
  console.log("📋 CLIENT SIGN-IN LINKS");
  console.log("=".repeat(80) + "\n");

  results.forEach((result) => {
    console.log(`🎙️  ${result.name.toUpperCase()}`);
    console.log(`   Type: ${result.clientType}`);
    console.log(`   Email: ${result.email}`);
    console.log(`   User ID: ${result.userId}`);
    console.log(`   🔗 Sign-In Link: ${result.signInUrl}`);
    console.log("");
  });

  console.log("=".repeat(80));
  console.log("\n💡 Share these links with your clients. They provide permanent access.");
  console.log("⚠️  Keep these links secure - anyone with the link can sign in!\n");

  
}

createClientAccounts()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });