import { configureNestJsTypebox } from 'nestjs-typebox';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import {
    DocumentBuilder,
    SwaggerModule,
} from '@nestjs/swagger';

import { ApiModule } from './api.module';

configureNestJsTypebox({
    patchSwagger: true,
    setFormats: true,
});

export async function createApp(options?: { setupSwagger?: boolean }) {
    const app = await NestFactory.create(ApiModule, new FastifyAdapter());

    // Optionally set up Swagger if needed.
    if (options?.setupSwagger) {
        const config = new DocumentBuilder()
            .setTitle('Huggg API')
            .setDescription('API documentation')
            .setVersion('1.0')
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('docs', app, document);
    }

    return app;
}

export async function bootstrap(path: string = '.env') {
    require('dotenv').config({ path });

    const app = await createApp({ setupSwagger: true });
    app.enableShutdownHooks();
    await app.listen(process.env.PORT ?? 3000);
}