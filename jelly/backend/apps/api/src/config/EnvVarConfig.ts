import { IRmqConfig } from '@app/common/rmq/types/config';
import { Logger } from '@nestjs/common';

import {
  IAppConfig,
  IAuthConfig,
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
  appConfig.DB.TYPE = process.env.DB_TYPE ?? '';
  appConfig.DB.PORT = Number(process.env.DB_PORT) ?? 5432;
  appConfig.DB.USERNAME = process.env.DB_USERNAME ?? '';
  appConfig.DB.PASSWORD = process.env.DB_PASSWORD ?? '';
  appConfig.DB.DATABASE = process.env.DB_DATABASE ?? '';
  appConfig.DB.SYNCHRONIZE = (process.env.DB_SYNCHRONIZE ?? '') === 'true';
  appConfig.DB.LOGGING = (process.env.DB_LOGGING ?? '') === 'true';

  // auth
  appConfig.AUTH = <IAuthConfig>{};
  appConfig.AUTH.API_KEY = process.env.AUTH_API_KEY;
  appConfig.AUTH.SECRET = process.env.AUTH_JWT_SECRET;

  // redis
  appConfig.REDIS = <IRedisConfig>{};
  appConfig.REDIS.HOST = process.env.REDIS_HOST ?? '';
  appConfig.REDIS.PORT = Number(process.env.REDIS_PORT) ?? 6379;
  appConfig.REDIS.PASSWORD = process.env.REDIS_PASSWORD ?? '';
  appConfig.REDIS.NAMESPACE = process.env.REDIS_NAMESPACE ?? 'default';

  // rmq
  appConfig.RMQ = <IRmqConfig>{};
  appConfig.RMQ.HOST = process.env.RMQ_HOST ?? '';
  appConfig.RMQ.PROTOCOL = process.env.RMQ_PROTOCOL ?? '';
  appConfig.RMQ.PORT = Number(process.env.RMQ_PORT);
  appConfig.RMQ.PASSWORD = process.env.RMQ_PASSWORD ?? '';
  appConfig.RMQ.USERNAME = process.env.RMQ_USERNAME ?? '';

  return { app: appConfig };
}
