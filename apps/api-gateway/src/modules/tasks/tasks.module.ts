import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { AuthModule } from '../auth/auth.module';
import { SecurityModule } from '../security/security.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksService } from './tasks.service';

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
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
