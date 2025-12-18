import { LoginDto } from "@task_manager/dtos";

export type LoginCommand = LoginDto & {
  email: string;
  password: string;
};
