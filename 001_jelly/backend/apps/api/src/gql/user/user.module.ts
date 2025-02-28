import { CoreModule, User } from '@app/common/coreModels';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DbModule } from '../../internal/db/db.module';
import { PubSubModule } from '../../internal/pubSub/pubSub.module';
import { RedisClientModule } from '../../internal/redis/redisClient.module';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    forwardRef(() => RedisClientModule),
    forwardRef(() => PubSubModule),
    forwardRef(() => DbModule),
    forwardRef(() => CoreModule),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
