import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ForgotPasswordDto {
  @ApiProperty({
    example: "user@email.com",
    description: "Email do usuário que deseja redefinir a senha",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string = "";

  @ApiProperty({
    example: "eduardo",
    description: "Username do usuário",
  })
  @IsString()
  @IsNotEmpty()
  username: string = "";
}
