import { RedisPubSub } from 'graphql-redis-subscriptions';

import {
  forwardRef,
  Module,
} from '@nestjs/common';

import { RedisClientModule } from '../redis/redisClient.module';
import { RedisService } from '../redis/service/redisService.service';

@Module({
  imports: [forwardRef(() => RedisClientModule)],
  providers: [
    {
      provide: 'PUB_SUB',
      useFactory: async (redisService: RedisService) => {
        const pubsub = new RedisPubSub({
          publisher: redisService.getNewClient(),
          subscriber: redisService.getNewClient(),
        });
        return pubsub;
      },
      inject: [RedisService],
    },
  ],
  exports: ['PUB_SUB'],
})
export class PubSubModule {}
