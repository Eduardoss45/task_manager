import { RegisterDto } from '../../dtos';

export type RegisterCommand = RegisterDto & {
  email: string;
  username: string;
  password: string;
};