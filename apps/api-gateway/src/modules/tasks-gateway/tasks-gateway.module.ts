import { Module } from '@nestjs/common';
import { TasksGatewayController } from './tasks-gateway.controller';
import { AuthModule } from '../auth-gateway/auth-gateway.module';
import { SecurityModule } from '../security/security.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksGatewayService } from './tasks-gateway.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'TASKS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RMQ_URL')!],
            queue: 'tasks_queue',
            queueOptions: { durable: false },
          },
        }),
      },
    ]),
    AuthModule,
    SecurityModule,
  ],
  providers: [TasksGatewayService],
  controllers: [TasksGatewayController],
})
export class TasksModule {}
