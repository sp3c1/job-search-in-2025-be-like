import { CoreModule } from '@app/common/coreModels';
import { Reciepie } from '@app/common/coreModels/models/reciepe.entity';
import { ReciepieToIngredient } from '@app/common/coreModels/models/reciepeToIngredient.entity';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbModule } from '../../internal/db/db.module';
import { PubSubModule } from '../../internal/pubSub/pubSub.module';
import { RedisClientModule } from '../../internal/redis/redisClient.module';
import { ReciepieResolver } from './reciepe.resolver';
import { ReciepieService, ReciepieToIngredientService } from './reciepe.service';

@Module({
  imports: [
    forwardRef(() => RedisClientModule),
    forwardRef(() => PubSubModule),
    forwardRef(() => DbModule),
    forwardRef(() => CoreModule),
    TypeOrmModule.forFeature([Reciepie, ReciepieToIngredient]),
  ],
  controllers: [],
  providers: [ReciepieResolver, ReciepieService, ReciepieToIngredientService],
  exports: [ReciepieService, ReciepieToIngredientService],
})
export class ReciepeModule {}
