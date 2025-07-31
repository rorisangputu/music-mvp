import { NextResponse } from "next/server";
import { signUpSchema } from "@/lib/validationSchemas";
import { createUser, getUserByEmail } from "@/lib/user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    //console.log(body);
    const { name, email, password } = signUpSchema.parse(body);

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use." },
        { status: 400 }
      );
    }
    //Create user
    const user = await createUser({ name, email, password, role: "USER" });

    return NextResponse.json(
      {
        success:
          "User account created successfully. Please verify your account.",
        redirectTo: `/verify?email=${encodeURIComponent(email)}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
