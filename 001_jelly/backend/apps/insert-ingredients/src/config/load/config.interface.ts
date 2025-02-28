import { IRmqConfig } from '@app/common/rmq/types/config';

export interface IAppConfig {
  ACTIVE_PROFILE: string;
  DB: IDBConfig;
  REDIS: IRedisConfig;
  RMQ: IRmqConfig;
}

export interface IRedisConfig {
  HOST: string;
  PORT: number;
  PASSWORD: string;
  NAMESPACE: string;
}

export interface IDBConfig {
  HOSTNAME: string;
  TYPE: string;
  PORT: number;
  USERNAME: string;
  PASSWORD: string;
  DATABASE: string;
  SYNCHRONIZE: boolean;
  LOGGING: boolean;
}
