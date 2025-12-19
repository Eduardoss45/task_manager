import { LoginDto } from '../../dtos';

export type LoginCommand = LoginDto & {
  email: string;
  password: string;
};
