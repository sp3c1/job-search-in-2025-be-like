import {
  Brand,
  BrandConsolidatedProduct,
  BrandProduct,
  BrandStore,
} from '@huggg/models/brand/brand.entity';
import {
  Product,
  ProductStore,
} from '@huggg/models/product/product.entity';
import { Store } from '@huggg/models/store/store.enitty';
import { Module } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CliService } from './cli.service';
import { loadEnvVarConfig } from './config/EnvVarConfig';
import { IAppConfig } from './config/load/config.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: ((configService: ConfigService) => {
        const config = configService.get<IAppConfig>('app');
        return {
          type: config.DB.TYPE,
          host: config.DB.HOSTNAME,
          port: +config.DB.PORT,
          username: config.DB.USERNAME,
          password: config.DB.PASSWORD,
          database: config.DB.DATABASE,
          entities: [
            Brand, Product, Store, BrandConsolidatedProduct, BrandProduct, BrandStore, ProductStore
          ],
          synchronize: config.DB.SYNCHRONIZE,
          logging: config.DB.LOGGING,
        }
      }),
    }),
    TypeOrmModule.forFeature([Brand, Product, Store, BrandConsolidatedProduct, BrandStore, BrandProduct, ProductStore]),
  ],
  controllers: [],
  providers: [CliService],
})
export class CliModule { }
