import { z } from "zod";

export const forgotPasswordSchema = z.object({
  username: z.string().min(3),
  email: z.email({ message: "Email inválido" }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
