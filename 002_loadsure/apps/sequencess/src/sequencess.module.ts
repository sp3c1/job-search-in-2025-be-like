import { Module } from '@nestjs/common';

import { SequencessService } from './sequencess.service';

@Module({
  imports: [],
  controllers: [],
  providers: [SequencessService],
  exports: [SequencessService],
})
export class SequencessModule {}
