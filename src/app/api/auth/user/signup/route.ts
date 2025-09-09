import { NextResponse } from "next/server";
import { signUpSchema } from "@/lib/validationSchemas";
import { createUser, getUserByEmail } from "@/lib/user";
import { ZodError } from "zod";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    //console.log(body);
    const result = signUpSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          errors: result.error.issues.map((e) => ({
            field: e.path[0],
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    const { name, email, password } = result.data;

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
  } catch (err) {
    console.error(err);
    
    
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
