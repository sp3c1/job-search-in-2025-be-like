import { RmqModule } from '@app/common';
import { CoreModule } from '@app/common/coreModels';
import { IngredientPrice } from '@app/common/coreModels/models/ingredientPrice.entity';
import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbModule } from '../../internal/db/db.module';
import { PubSubModule } from '../../internal/pubSub/pubSub.module';
import { RedisClientModule } from '../../internal/redis/redisClient.module';
import { IngredientPriceResolver } from './ingredientPrice.resolver';
import { IngredientPriceService } from './ingredientPrice.service';

@Module({
  imports: [
    forwardRef(() => RedisClientModule),
    forwardRef(() => PubSubModule),
    forwardRef(() => DbModule),
    forwardRef(() => CoreModule),
    forwardRef(() => RmqModule),
    TypeOrmModule.forFeature([IngredientPrice]),
  ],
  controllers: [],
  providers: [IngredientPriceService, IngredientPriceResolver],
  exports: [IngredientPriceService],
})
export class IngredientPriceModule { }
