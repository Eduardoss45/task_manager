import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class RegisterDto {
  @ApiProperty({ example: "user@email.com" })
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  @IsNotEmpty()
  email: string = "";

  @ApiProperty({ example: "eduardo" })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  username: string = "";

  @ApiProperty({ example: "123456", minLength: 6 })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  @MinLength(6)
  password: string = "";
}
