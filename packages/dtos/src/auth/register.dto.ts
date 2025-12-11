import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string = "";

  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  username: string = "";

  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MinLength(6)
  password: string = "";
}
