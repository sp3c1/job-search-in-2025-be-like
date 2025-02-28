import Redis, { Redis as RedisClient } from 'ioredis';

import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { IAppConfig } from '../../../config/load/config.interface';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: RedisClient;

  constructor(private readonly configService: ConfigService) {
    // Initialize the Redis client
    this.redisClient = new Redis({
      host: configService.get<IAppConfig>('app')!.REDIS.HOST,
      port: configService.get<IAppConfig>('app')!.REDIS.PORT,
      ...(configService.get<IAppConfig>('app')!.REDIS.PASSWORD && {
        password: configService.get<IAppConfig>('app')!.REDIS.PASSWORD,
      }),
      retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
      },
    });
  }

  onModuleInit() {
    this.redisClient.on('connect', () => {
      Logger.log('Connected to Redis');
    });
    this.redisClient.on('error', (err) => Logger.error('Redis error', err));
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  getClient(): Redis {
    return this.redisClient;
  }

  getNewClient(): Redis {
    return new Redis({
      host: this.configService.get<IAppConfig>('app')!.REDIS.HOST,
      port: this.configService.get<IAppConfig>('app')!.REDIS.PORT,
      ...(this.configService.get<IAppConfig>('app')!.REDIS.PASSWORD && {
        password: this.configService.get<IAppConfig>('app')!.REDIS.PASSWORD,
      }),
    });
  }
}
