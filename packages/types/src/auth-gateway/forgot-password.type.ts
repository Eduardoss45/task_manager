import { ForgotPasswordDto } from "@task_manager/dtos";

export type ForgotPasswordCommand = ForgotPasswordDto & {
  email: string;
  username: string;
};
