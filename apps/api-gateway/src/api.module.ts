import { AuthModule } from './modules/auth-gateway/auth-gateway.module';
import { TasksModule } from './modules/tasks-gateway/tasks-gateway.module';
import { NotificationsModule } from './modules/notifications-gateway/notifications-gateway.module';
import { HealthModule } from './modules/healt-checks/health.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000,
          limit: 10,
        },
      ],
    }),
    AuthModule,
    TasksModule,
    NotificationsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiModule {}
