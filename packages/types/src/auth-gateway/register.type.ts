import { RegisterDto } from "@task_manager/dtos";

export type RegisterCommand = RegisterDto & {
  email: string;
  username: string;
  password: string;
};