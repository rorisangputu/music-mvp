import { z } from "zod";
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 3 characters."),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters"),
});

export const verifyCodeSchema = z.object({
  email: z.email(),
  code: z.string().length(6),
});
