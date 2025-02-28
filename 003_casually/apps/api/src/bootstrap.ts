import * as compression from 'compression';

import { errorHandler } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { ApiModule } from './api.module';

ValidationPipe

export async function setupApp(loggerOff = false) {
  const app = await NestFactory.create(ApiModule, {
    bodyParser: true,
    cors: {
      origin: '*',
      credentials: true,
    },
    ...(loggerOff && { logger: false }),
  });

  const config = new DocumentBuilder()
    .setTitle('Developer portal')
    .setDescription('The API Causaly Doc')
    .setVersion('1.0')
    .build();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,    // Enables class-transformer globally
      whitelist: true,    // Strips out unexpected properties
      forbidNonWhitelisted: false, // Blocks unknown properties if true
    })
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.use(compression());
  app.use(errorHandler);
  app.enableShutdownHooks();

  return app;
}

export async function bootstrap(path: string) {
  require('dotenv').config({ ...(path && { path }), override: true });

  const app = await setupApp();
  await app.listen(process.env.port ?? 3000);
}
