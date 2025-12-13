import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RmqExceptionInterceptor } from './modules/exception/rmq-exception.interceptor';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new RmqExceptionInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Jungle Gaming API')
    .setDescription('Documentação da API do Jungle Gaming')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

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
