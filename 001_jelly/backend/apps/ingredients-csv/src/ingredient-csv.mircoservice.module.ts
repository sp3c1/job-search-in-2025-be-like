import {
  CommonModule,
  RmqModule,
} from '@app/common';
import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { Supplier } from '@app/common/coreModels/models/supplier.entity';
import { SupplierToIngredient } from '@app/common/coreModels/models/supplierToIngredient.entity';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { loadEnvVarConfig } from './config/EnvVarConfig';
import { IngredientCsvMircoServiceService } from './ingredient-csv.service';
import { DbModule } from './internal/db/db.module';
import { PubSubModule } from './internal/pubSub/pubSub.module';
import { RedisClientModule } from './internal/redis/redisClient.module';
import {
  IngredientService,
  SupplierService,
} from './services';

@Module({
  imports: [
    RedisClientModule,
    PubSubModule,
    RmqModule,
    DbModule,
    CommonModule,
    TypeOrmModule.forFeature([Supplier, SupplierToIngredient, Ingredient]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
  ],
  controllers: [],
  providers: [IngredientService, SupplierService, IngredientCsvMircoServiceService],
})
export class IngredientCsvMircoserviceModule { }
