import { Logger } from '@nestjs/common';

import {
  IAppConfig,
  ICacheConfig,
  IDBConfig,
  IRedisConfig,
} from './load/config.interface';

export async function loadEnvVarConfig() {
  Logger.log(`Config loaded from ENV variables`, { context: 'ConfigLoader' });

  const appConfig = <IAppConfig>{};
  appConfig.ACTIVE_PROFILE = process.env.ACTIVE_PROFILE ?? 'local';

  // postgres
  appConfig.DB = <IDBConfig>{};
  appConfig.DB.HOSTNAME = process.env.DB_HOSTNAME ?? '';
  appConfig.DB.TYPE = process.env.DB_TYPE as any ?? 'postgres';
  appConfig.DB.PORT = Number(process.env.DB_PORT);
  appConfig.DB.USERNAME = process.env.DB_USERNAME ?? '';
  appConfig.DB.PASSWORD = process.env.DB_PASSWORD ?? '';
  appConfig.DB.DATABASE = process.env.DB_DATABASE ?? '';
  appConfig.DB.SYNCHRONIZE = (process.env.DB_SYNCHRONIZE ?? '') === 'true';
  appConfig.DB.LOGGING = (process.env.DB_LOGGING ?? '') === 'true';

  // redis
  appConfig.REDIS = <IRedisConfig>{};
  appConfig.REDIS.HOST = process.env.REDIS_HOST ?? '';
  appConfig.REDIS.PORT = Number(process.env.REDIS_PORT) ?? 6379;
  appConfig.REDIS.PASSWORD = process.env.REDIS_PASSWORD ?? '';
  appConfig.REDIS.NAMESPACE = process.env.REDIS_NAMESPACE ?? 'default';

  appConfig.CACHE = <ICacheConfig>{};
  appConfig.CACHE.DB = Number(process.env.CACHE_DB || 500);
  appConfig.CACHE.HTTP = Number(process.env.CACHE_HTTP || 500);

  return { app: appConfig };
}
