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

import { ApiService } from './api.service';
import { loadEnvVarConfig } from './config/EnvVarConfig';
import { IAppConfig } from './config/load/config.interface';
import { CacheModule } from './internal/cache/cache.module';
import { RedisClientModule } from './internal/redis/redisClient.module';
import { BrandModule } from './modules/brand/brand.module';
import { ProductModule } from './modules/product/product.module';
import { StoreModule } from './modules/store/store.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
    RedisClientModule,
    CacheModule,
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
          cache: {
            type: 'redis',
            options: {
              host: config.REDIS.HOST,
              port: config.REDIS.PORT,
              ...(config.REDIS.PASSWORD && { password: config.REDIS.PASSWORD }),
            },
            duration: config.CACHE.DB,
            ignoreErrors: true,
          },
        }
      }),
    }),
    TypeOrmModule.forFeature([Brand, Product, Store, BrandConsolidatedProduct, BrandProduct, BrandStore, ProductStore]),
    BrandModule,
    ProductModule,
    StoreModule,
  ],
  controllers: [],
  providers: [ApiService],
})
export class ApiModule { }
