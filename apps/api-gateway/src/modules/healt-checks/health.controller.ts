import { HealthService } from './health.service';
import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@task_manager/logger';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Saúde do Sistema')
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly logger: LoggerService,
  ) {}

  @Get('live')
  @ApiOperation({ summary: 'Verifica se a aplicação está viva (liveness)' })
  @ApiResponse({
    status: 200,
    description: 'Retorna o status da aplicação',
    schema: {
      example: { status: 'up' },
    },
  })
  healthCheckGateway() {
    return { status: 'up' };
  }

  @Get('services')
  @ApiOperation({
    summary: 'Verifica a disponibilidade dos serviços dependentes (readiness)',
  })
  @ApiResponse({
    status: 200,
    description: 'Status de todos os serviços dependentes',
    schema: {
      example: {
        auth: 'up',
        tasks: 'up',
        notifications: 'up',
        audits: 'up',
        gateway: 'up',
      },
    },
  })
  async healthCheckServices() {
    this.logger.info('Solicitação de verificação de saúde');

    const result = await this.healthService.checkReadiness();

    this.logger.info('Verificação de saúde concluída', result);

    return result;
  }
}
