import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';

import { RmqService } from './rmq.service';

@Module({
  imports: [DiscoveryModule],
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {}
