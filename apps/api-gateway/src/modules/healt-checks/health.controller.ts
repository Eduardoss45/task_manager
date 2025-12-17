import { HealthService } from './health.service';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get('live')
  healthCheckGateway() {
    return { status: 'up' };
  }

  @Get('services')
  async healthCheckServices() {
    return this.healthService.checkReadiness();
  }
}
