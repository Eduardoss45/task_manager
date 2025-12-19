import { IsNotEmpty, MinLength, IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({
    example: "550e8400-e29b-41d4-a716-446655440000",
    description: "Token de redefinição recebido por email",
  })
  @IsUUID()
  @IsNotEmpty()
  token: string = "";

  @ApiProperty({
    example: "newStrongPassword123",
    description: "Nova senha do usuário",
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string = "";
}

