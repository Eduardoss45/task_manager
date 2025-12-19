import { ForgotPasswordDto } from "../../dtos";

export type ForgotPasswordCommand = ForgotPasswordDto & {
  email: string;
  username: string;
};
