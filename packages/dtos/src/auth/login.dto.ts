import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, MinLength, IsNotEmpty } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
  @ApiProperty({
    example: "user@email.com",
    description: "Email do usuário",
  })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string = "";

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
