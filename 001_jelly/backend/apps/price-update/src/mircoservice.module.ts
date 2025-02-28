import {
  CommonModule,
  RmqModule,
} from '@app/common';
import {
  Ingredient,
  IngredientPrice,
  Reciepie,
  ReciepieToIngredient,
  Supplier,
  SupplierToIngredient,
  User,
} from '@app/common/coreModels/models';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { loadEnvVarConfig } from './config/EnvVarConfig';
import { DbModule } from './internal/db/db.module';
import { PubSubModule } from './internal/pubSub/pubSub.module';
import { RedisClientModule } from './internal/redis/redisClient.module';
import { MircoServiceService } from './mircoservice.service';
import {
  IngredientPriceService,
  IngredientService,
} from './services';

@Module({
  imports: [
    RedisClientModule,
    PubSubModule,
    RmqModule,
    DbModule,
    CommonModule,
    TypeOrmModule.forFeature([
      Ingredient,
      IngredientPrice,
      Supplier,
      Reciepie,
      ReciepieToIngredient,
      SupplierToIngredient,
      User
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
  ],
  controllers: [],
  providers: [IngredientService, IngredientPriceService, MircoServiceService],
})
export class MircoserviceModule { }
