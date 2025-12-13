import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entity/task.entity';
import { Comment } from './entity/comment.entity';
import { TasksRepository } from './entity/repository/tasks.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL!,
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Task, Comment]),
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksRepository],
})
export class TasksModule {}
