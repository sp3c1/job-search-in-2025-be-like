import { Module } from '@nestjs/common';

import { CommonService } from './common.service';
import { UploadScalar } from './scalars';

@Module({
  providers: [CommonService, UploadScalar],
  exports: [CommonService, UploadScalar],
})
export class CommonModule {}
