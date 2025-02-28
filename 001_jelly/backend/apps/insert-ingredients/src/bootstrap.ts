import { NestFactory } from '@nestjs/core';

import { MircoserviceModule } from './mircoservice.module';

export async function bootstrap(path: string) {
  require('dotenv').config({ ...(path && { path }), override: true });

  await NestFactory.createApplicationContext(MircoserviceModule);
}
