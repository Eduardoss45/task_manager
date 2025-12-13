import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { Comment } from './entity/comment.entity';
import { TaskAuditLog } from './entity/task-audit-log.entity';
import { TasksRepository } from './entity/repository/tasks.repository';
import { TaskAuditRepository } from './entity/repository/task-audit.repository';
import { TaskAuditService } from './task-audit.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL!,
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Task, Comment, TaskAuditLog]),
    ClientsModule.registerAsync([
      {
        name: 'NOTIFICATIONS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RMQ_URL')!],
            queue: 'notifications_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    TasksRepository,
    TaskAuditRepository,
    TaskAuditService,
  ],
})
export class TasksModule {}
