import {
  Reciepie,
  ReciepieToIngredient,
  User,
} from '@app/common/coreModels';
import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { IngredientPrice } from '@app/common/coreModels/models/ingredientPrice.entity';
import { Supplier } from '@app/common/coreModels/models/supplier.entity';
import { SupplierToIngredient } from '@app/common/coreModels/models/supplierToIngredient.entity';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAppConfig } from '../../config/load/config.interface';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [],
      // https://docs.nestjs.com/techniques/database
      useFactory: <any>((configService: ConfigService) => ({
        type: configService.get<IAppConfig>('app').DB.TYPE,
        host: configService.get<IAppConfig>('app').DB.HOSTNAME,
        port: configService.get<IAppConfig>('app').DB.PORT,
        username: configService.get<IAppConfig>('app').DB.USERNAME,
        password: configService.get<IAppConfig>('app').DB.PASSWORD,
        database: configService.get<IAppConfig>('app').DB.DATABASE,
        entities: [
          Supplier,
          Ingredient,
          IngredientPrice,
          Reciepie,
          ReciepieToIngredient,
          SupplierToIngredient,
          User
        ],
        synchronize: false,
        logging: configService.get<IAppConfig>('app').DB.LOGGING,
        cache: {
          type: 'ioredis',
          duration: 5000, // 5 seconds
          options: {
            host: configService.get<IAppConfig>('app').REDIS.HOST,
            password: configService.get<IAppConfig>('app').REDIS.PASSWORD,
            port: configService.get<IAppConfig>('app').REDIS.PORT,
            database: 2,
          },
        },
      })),
      inject: [ConfigService],
    }),
  ],
  exports: [TypeOrmModule],
})
export class DbModule { }
