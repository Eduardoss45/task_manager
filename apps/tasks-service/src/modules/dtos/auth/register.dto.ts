import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterDto {
  @ApiProperty({
    example: "user@email.com",
    description: "Email único do usuário",
  })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string = "";

  @ApiProperty({
    example: "eduardo",
    description: "Nome de usuário público",
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  username: string = "";

  @ApiProperty({
    example: "123456",
    description: "Senha do usuário",
    minLength: 6,
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MinLength(6)
  password: string = "";
}
