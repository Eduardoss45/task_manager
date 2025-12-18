import { ResetPasswordDto } from "@task_manager/dtos";

export type ResetPasswordCommand = ResetPasswordDto & {
  token: string;
  newPassword: string;
};