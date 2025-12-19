import { ResetPasswordDto } from '../../dtos';

export type ResetPasswordCommand = ResetPasswordDto & {
  token: string;
  newPassword: string;
};