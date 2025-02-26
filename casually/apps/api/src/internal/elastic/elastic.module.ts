import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { IAppConfig } from '../../config/load/config.interface';
import { ElasticService } from './service/elastic.service';

@Module({
  imports: [
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
  providers: [ElasticService],
  exports: [ElasticService],
})
export class ElasticModule {}
