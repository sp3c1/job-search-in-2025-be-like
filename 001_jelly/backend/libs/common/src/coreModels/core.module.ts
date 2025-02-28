import { Module } from '@nestjs/common';

import { ProjectionService } from './models';

@Module({
  imports: [],
  exports: [ProjectionService],
  providers: [ProjectionService],
  controllers: [],
})
export class CoreModule { }
