import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { AuthModule } from '../auth-gateway/auth-gateway.module';
import { TasksModule } from '../tasks-gateway/tasks-gateway.module';
import { NotificationsModule } from '../notifications-gateway/notifications-gateway.module';

@Module({
  imports: [AuthModule, TasksModule, NotificationsModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
