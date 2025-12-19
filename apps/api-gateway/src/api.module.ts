import { AuthModule } from './modules/auth-gateway/auth-gateway.module';
import { TasksModule } from './modules/tasks-gateway/tasks-gateway.module';
import { NotificationsModule } from './modules/notifications-gateway/notifications-gateway.module';
import { HealthModule } from './modules/healt-checks/health.module';
import { LoggerModule } from './modules/logger';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RmqExceptionInterceptor } from './modules/exception/rmq-exception.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    LoggerModule.forRoot({
      service: 'api-gateway',
    }),

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
      provide: APP_INTERCEPTOR,
      useClass: RmqExceptionInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class ApiModule {}
