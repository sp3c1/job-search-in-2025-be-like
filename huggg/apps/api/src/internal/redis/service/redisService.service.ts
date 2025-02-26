import Redis, { Redis as RedisClient } from 'ioredis';

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClient;

  constructor(private readonly configService: ConfigService) {
    this.redisClient = this.getNewClient();
  }

  onModuleInit() {
    this.redisClient.on('connect', () => {
      Logger.log('Connected to Redis');
    });
  }

  onModuleDestroy() {
    try {
      this.redisClient.quit();
    } catch (_) { }
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getNewClient(): Redis {
    const localClient = new Redis({
      host: this.configService.getOrThrow<string>('app.REDIS.HOST'),
      port: this.configService.getOrThrow<number>('app.REDIS.PORT'),
      ...(this.configService.getOrThrow<string>('app.REDIS.PASSWORD') && {
        password: this.configService.get<string>('app.REDIS.PASSWORD')
      }),
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });

    localClient.on('error', (err) => {
      Logger.error('Redis client encountered an error:', err);
    });

    return localClient;
  }
}
