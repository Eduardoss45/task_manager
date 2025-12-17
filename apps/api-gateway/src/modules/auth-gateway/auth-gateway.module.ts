import { Module } from '@nestjs/common';
import { AuthGatewayController } from './auth-gateway.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGatewayService } from './auth-gateway.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RMQ_URL')!],
            queue: 'auth_queue',
            queueOptions: { durable: false },
          },
        }),
      },
    ]),
  ],
  providers: [AuthGatewayService],
  controllers: [AuthGatewayController],
  exports: [ClientsModule],
})
export class AuthModule {}
