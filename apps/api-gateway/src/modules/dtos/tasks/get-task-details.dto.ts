import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskDetailsDto {
  @ApiProperty()
  id: string = '';

  @ApiProperty()
  title: string = '';

  @ApiProperty()
  status: string = '';

  @ApiProperty()
  authorId: string = '';

  @ApiProperty()
  comments?: any[];

  @ApiProperty()
  authorName: string = '';

  @ApiPropertyOptional({
    type: [Object],
    description: 'Usuários atribuídos à tarefa',
  })
  assignedUserIds?: any[];

  @ApiPropertyOptional({
    type: [Object],
    isArray: true,
    description:
      'Histórico da tarefa (audit). Estrutura dinâmica, gerada por outros microserviços.',
  })
  audit?: any[];
}
