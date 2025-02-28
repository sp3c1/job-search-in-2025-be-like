import * as compression from 'compression';
import { graphqlUploadExpress } from 'graphql-upload-ts';

import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { ApiModule } from './api.module';

export async function bootstrap(path: string) {
  require('dotenv').config({ ...(path && { path }), override: true });

  const app = await NestFactory.create(ApiModule, {
    bodyParser: true,
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Template API')
    .setDescription('The Template API Doc')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  app.use(compression());
  app.use(
    graphqlUploadExpress({
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      overrideSendResponse: false,
    })
  );
  app.enableShutdownHooks();

  await app.listen(process.env.port ?? 3000);
}
