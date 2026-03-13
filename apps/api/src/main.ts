import { AppModule } from './modules/app/app.module';
import { CLIENT_JSON_PATH } from './utils/consts';
import { APP_URL, PORT, SESSION_SECRET } from './utils/env';
import fastifyCookie from '@fastify/cookie';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFile } from 'fs/promises';

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

  const config = new DocumentBuilder()
    .setTitle('Scrap Casino API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await writeFile(CLIENT_JSON_PATH, JSON.stringify(document, null, 2));

  await app.listen(PORT, '0.0.0.0');
}

bootstrap();
