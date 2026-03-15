import { AppModule } from '../modules/app/app.module';
import { CLIENT_JSON_PATH } from '../utils/consts';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { writeFile } from 'fs/promises';

dotenv.config();

async function generate() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: false },
  );

  const config = new DocumentBuilder()
    .setTitle('Scrap Casino API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  await writeFile(CLIENT_JSON_PATH, JSON.stringify(document, null, 2));

  await app.close();
  console.log(`Wrote ${CLIENT_JSON_PATH}`);
}

generate();
