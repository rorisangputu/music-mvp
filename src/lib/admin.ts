import db from "@/db/db";
import bcrypt from "bcryptjs";

export async function createAdmin(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "SUPER_ADMIN";
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12);

  return await db.admin.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "ADMIN",
    },
  });
}

export async function getAdminByEmail(email: string) {
  return await db.admin.findUnique({
    where: { email },
  });
}
