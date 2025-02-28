import { NestFactory } from '@nestjs/core';

import { SequencessModule } from './sequencess.module';
import { SequencessService } from './sequencess.service';

async function bootstrap() {
  const app = await NestFactory.create(SequencessModule, { logger: false });
  const sequenceService = app.get(SequencessService);
  sequenceService.exec();
  await app.close();
}
bootstrap();
