import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { AuthModule } from '../auth/auth.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [AuthModule, SecurityModule],
  controllers: [TasksController],
})
export class TasksModule {}
