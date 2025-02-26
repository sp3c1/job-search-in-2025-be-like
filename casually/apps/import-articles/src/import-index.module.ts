import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { loadEnvVarConfig } from './config/EnvVarConfig';
import { IAppConfig } from './config/load/config.interface';
import { ImportIndexService } from './import-index.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
    // Register ElasticsearchModule asynchronously so that it can use the ConfigService
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<IAppConfig>('app').ELASTIC.NODE,
        ...((configService.get<IAppConfig>('app').ELASTIC.USERNAME ||
          configService.get<IAppConfig>('app').ELASTIC.PASSWORD) && {
          auth: {
            username: configService.get<IAppConfig>('app').ELASTIC.USERNAME,
            password: configService.get<IAppConfig>('app').ELASTIC.PASSWORD,
          },
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [ImportIndexService],
})
export class ImportIndexModule {}
