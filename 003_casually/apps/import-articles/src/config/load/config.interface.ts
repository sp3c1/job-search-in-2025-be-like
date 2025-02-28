export interface IAppConfig {
  ACTIVE_PROFILE: string;
  ELASTIC: IElasticConfig;
}

export interface IElasticConfig {
  NODE: string;
  USERNAME: string;
  PASSWORD: string;
}
