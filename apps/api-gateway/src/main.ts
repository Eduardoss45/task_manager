import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport } from '@nestjs/microservices';
import { LoggerService } from './modules/logger';

import {
  LoginDto,
  RegisterDto,
  CreateTaskDto,
  TaskDetailsDto,
  UpdateTaskDto,
  CreateCommentDto,
  AssignedUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './modules/dtos';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      extraModels: [
        LoginDto,
        RegisterDto,
        CreateTaskDto,
        TaskDetailsDto,
        UpdateTaskDto,
        CreateCommentDto,
        AssignedUserDto,
        ForgotPasswordDto,
        ResetPasswordDto,
      ],
    });

  SwaggerModule.setup('api/docs', app, documentFactory, {
    jsonDocumentUrl: 'api/docs-json',
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL!],
      queue: 'gateway_notifications_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
