import { Logger } from '@nestjs/common';

import {
  IAppConfig,
  IElasticConfig,
} from './load/config.interface';

export async function loadEnvVarConfig() {
  Logger.log(`Config loaded from ENV variables`, { context: 'ConfigLoader' });

  const appConfig = <IAppConfig>{};

  appConfig.ACTIVE_PROFILE = process.env.ACTIVE_PROFILE ?? 'local';

  // postgres
  appConfig.ELASTIC = <IElasticConfig>{};
  appConfig.ELASTIC.NODE = process.env.ELASTIC_NODE ?? '';
  appConfig.ELASTIC.USERNAME = process.env.ELASTIC_USERNAME ?? '';
  appConfig.ELASTIC.PASSWORD = process.env.ELASTIC_PASSWORD ?? '';

  return { app: appConfig };
}
