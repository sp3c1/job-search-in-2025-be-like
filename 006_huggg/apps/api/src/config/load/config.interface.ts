import { ORMConfigDbType } from '@huggg/models';

export interface IAppConfig {
  ACTIVE_PROFILE: string;
  DB: IDBConfig;
  REDIS: IRedisConfig;
  CACHE: ICacheConfig;
}

export interface IDBConfig {
  HOSTNAME: string;
  TYPE: any | ORMConfigDbType;
  PORT: number;
  USERNAME: string;
  PASSWORD: string;
  DATABASE: string;
  SYNCHRONIZE: boolean;
  LOGGING: boolean;
}

export interface IRedisConfig {
  HOST: string;
  PORT: number;
  PASSWORD: string;
  NAMESPACE: string;
}

// generic default settings
export interface ICacheConfig {
  HTTP: number;
  DB: number;
}