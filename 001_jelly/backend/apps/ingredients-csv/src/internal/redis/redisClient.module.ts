import { Module } from '@nestjs/common';

import { RedisService } from './service/redisService.service';

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisClientModule {}
