import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TasksController } from './modules/controllers/tasks.controller';
import { TasksService } from './modules/services/tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './modules/entities/task.entity';
import { Comment } from './modules/entities/comment.entity';
import { TaskAuditLog } from './modules/entities/task-audit-log.entity';
import { TasksRepository } from './modules/repositories/tasks.repository';
import { TaskAuditRepository } from './modules/repositories/task-audit.repository';
import { TaskAuditService } from './modules/services/task-audit.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
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
        name: 'NOTIFICATIONS_EVENTS',
        useFactory: () => ({
          transport: Transport.RMQ,
          options: {
            urls: [process.env.RMQ_URL!],
            queue: 'notifications_events_queue',
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
