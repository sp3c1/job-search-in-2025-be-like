import { Module } from '@nestjs/common';
import { CausalyService } from './causaly.service';

@Module({
  providers: [CausalyService],
  exports: [CausalyService],
})
export class CausalyModule {}
