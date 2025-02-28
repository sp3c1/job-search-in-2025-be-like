import { RmqModule } from '@app/common';
import { CoreModule } from '@app/common/coreModels';
import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbModule } from '../../internal/db/db.module';
import { PubSubModule } from '../../internal/pubSub/pubSub.module';
import { RedisClientModule } from '../../internal/redis/redisClient.module';
import { IngredientPriceModule } from '../ingredientPrice/ingredientPrice.module';
import { SupplierModule } from '../supplier/supplier.module';
import { FileUploadResolver } from './ingradients-upload.resolver';
import { IngredientResolver } from './ingredient.resolver';
import { IngredientService } from './ingredient.service';
import { IngredientSubscriptionResolver } from './subscription.resolver';
import { TrackcreationSubscriptionResolver } from './trackcreationSubscription.resolver';

@Module({
  imports: [
    forwardRef(() => RedisClientModule),
    forwardRef(() => PubSubModule),
    forwardRef(() => DbModule),
    forwardRef(() => CoreModule),
    forwardRef(() => IngredientPriceModule),
    forwardRef(() => SupplierModule),
    forwardRef(() => RmqModule),
    TypeOrmModule.forFeature([Ingredient]),
  ],
  controllers: [],
  providers: [
    FileUploadResolver,
    IngredientResolver,
    IngredientSubscriptionResolver,
    TrackcreationSubscriptionResolver,
    IngredientService,
  ],
  exports: [IngredientService],
})
export class IngredientModule { }
