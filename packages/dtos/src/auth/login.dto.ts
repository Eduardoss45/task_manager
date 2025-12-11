import { IsEmail, MinLength, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string = "";

  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MinLength(6)
  password: string = "";
}
