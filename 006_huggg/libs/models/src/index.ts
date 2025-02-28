import { DataSourceOptions } from 'typeorm';

export * from './models.module';
export * from './pagination/pagination';

export type ORMConfigDbType = DataSourceOptions['type'];
