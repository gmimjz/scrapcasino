import { AppModule } from './modules/app/app.module';
import { APP_URL, PORT, SESSION_SECRET } from './utils/env';
import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  app.register(fastifyCookie, {
    secret: SESSION_SECRET,
  });

  app.enableCors({
    origin: APP_URL,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });

  await app.listen(PORT, '0.0.0.0');
}

bootstrap();
