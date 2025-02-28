import { CoreModule } from '@app/common/coreModels';
import { Supplier } from '@app/common/coreModels/models/supplier.entity';
import { SupplierToIngredient } from '@app/common/coreModels/models/supplierToIngredient.entity';
import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbModule } from '../../internal/db/db.module';
import { PubSubModule } from '../../internal/pubSub/pubSub.module';
import { RedisClientModule } from '../../internal/redis/redisClient.module';
import { SupplierSubscriptionResolver } from './subscription.resolver';
import { SupplierResolver } from './supplier.resolver';
import { SupplierService } from './supplier.service';
import { SupplierToIngredientService } from './supplierToIngredient.service';

@Module({
  imports: [
    forwardRef(() => RedisClientModule),
    forwardRef(() => PubSubModule),
    forwardRef(() => DbModule),
    forwardRef(() => CoreModule),
    TypeOrmModule.forFeature([Supplier, SupplierToIngredient]),
  ],
  controllers: [],
  providers: [
    SupplierResolver,
    SupplierService,
    SupplierToIngredientService,
    SupplierSubscriptionResolver,
  ],
  exports: [SupplierService, SupplierToIngredientService],
})
export class SupplierModule { }
