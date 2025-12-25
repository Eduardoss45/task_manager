import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateCommentDto {
  @ApiProperty({
    example: 'Comentário de teste',
    description: 'Conteúdo do comentário',
  })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  content: string = '';
}
