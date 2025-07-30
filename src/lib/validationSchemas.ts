import { z } from "zod";
export const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export const verifyCodeSchema = z.object({
  email: z.email(),
  code: z.string().length(6),
});
