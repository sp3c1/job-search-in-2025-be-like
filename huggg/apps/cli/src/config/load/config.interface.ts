import { ORMConfigDbType } from '@huggg/models';

export interface IAppConfig {
  ACTIVE_PROFILE: string;
  DB: IDBConfig;
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