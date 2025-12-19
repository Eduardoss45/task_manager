import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";

export class CreateCommentDto {
  @ApiProperty({ example: "Comentário de teste", description: "Conteúdo do comentário" })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  content: string = "";

  @ApiPropertyOptional({
    example: "987e6543-e21b-12d3-a456-426655440000",
    description: "ID do autor do comentário",
  })
  @IsOptional()
  @IsString()
  authorId?: string;

  @ApiPropertyOptional({ example: "John", description: "Nome do autor do comentário" })
  @IsOptional()
  @IsString()
  authorName?: string;
}
