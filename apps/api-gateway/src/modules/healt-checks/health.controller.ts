import { HealthService } from './health.service';
import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@task_manager/logger';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly logger: LoggerService,
  ) {}

  @Get('live')
  healthCheckGateway() {
    return { status: 'up' };
  }

  @Get('services')
  async healthCheckServices() {
    this.logger.info('Health check requested');

    const result = await this.healthService.checkReadiness();

    this.logger.info('Health check completed', result);

    return result;
  }
}
