import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class CreateCommentDto {
  @Transform(({ value }: { value: any }) => value?.trim())
  @IsNotEmpty()
  content: string = "";

  @IsString()
  @IsOptional()
  authorId?: string;

  @IsString()
  @IsOptional()
  authorName?: string;
}
