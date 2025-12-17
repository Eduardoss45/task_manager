import { IsNotEmpty, MinLength, IsString, IsUUID } from "class-validator";

export class ResetPasswordDto {
  @IsUUID()
  @IsNotEmpty()
  token: string = "";

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string = "";
}
