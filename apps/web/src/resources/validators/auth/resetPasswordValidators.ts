import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    token: z.uuid(),
    newPassword: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
