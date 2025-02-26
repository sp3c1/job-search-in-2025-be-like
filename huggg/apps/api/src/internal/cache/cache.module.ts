import {
  forwardRef,
  Module,
} from '@nestjs/common';

import { RedisClientModule } from '../../internal/redis/redisClient.module';
import { CacheService } from './service/cache.service';

@Module({
  imports: [forwardRef(() => RedisClientModule)],
  exports: [CacheService],
  controllers: [],
  providers: [CacheService],
})
export class CacheModule { }
