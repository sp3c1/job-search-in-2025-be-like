import { NestFactory } from '@nestjs/core';

import { IngredientCsvMircoserviceModule } from './ingredient-csv.mircoservice.module';

export async function bootstrap(path: string) {
  require('dotenv').config({ ...(path && { path }), override: true });

  await NestFactory.createApplicationContext(IngredientCsvMircoserviceModule);
}
