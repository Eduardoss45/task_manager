import { UserRepository } from './repositories/user.repository';
import { PasswordResetRepository } from './repositories/password-reset.repository';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { User } from './entities/user.entity';
import { PasswordReset } from './entities/password-reset.entity';
import { PasswordResetService } from './services/password-reset.service';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL!,
      autoLoadEntities: true,
      synchronize: false,
    }),

    TypeOrmModule.forFeature([User, PasswordReset]),

    JwtModule.register({
      secret: process.env.JWT_SECRET!,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetService,
    UserRepository,
    PasswordResetRepository,
  ],
})
export class AuthModule {}
