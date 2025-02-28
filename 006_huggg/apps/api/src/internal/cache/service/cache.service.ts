import { createHash } from 'crypto';
import { Redis } from 'ioredis';

import { Injectable } from '@nestjs/common';

import { RedisService } from '../../../internal/redis/service/redisService.service';

@Injectable()
export class CacheService {
  private redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  async get<const T>(key: string) {
    const keyVal = await this.redis.get(key);
    try {
      return <T>JSON.parse(keyVal);
    } catch (_) {
      return keyVal;
    }
  }

  makeHashKey(path, subpath, params = <Record<string, unknown>>{}) {
    return `${path}:${subpath}:` + createHash('sha256')
      .update(`${path} ${subpath}:${JSON.stringify(params)}`)
      .digest('hex')
  }


  setex(key: string, obj: unknown, ttlMs: number) {
    let value: string;

    if (typeof obj === 'string' || typeof obj === 'number') {
      value = String(obj);
    } else {
      value = JSON.stringify(obj);
    }

    // Redis expects TTL in seconds.
    // const ttlSeconds = Math.floor(ttlMs / 1000);
    return this.redis.setex(key, ttlMs, value);
  }

}
