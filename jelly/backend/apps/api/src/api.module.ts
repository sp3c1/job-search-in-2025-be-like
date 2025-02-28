import {
  RmqModule,
  UploadScalar,
} from '@app/common';
import { CoreModule } from '@app/common/coreModels';
import { IngredientPrice } from '@app/common/coreModels/models/ingredientPrice.entity';
import {
  ApolloDriver,
  ApolloDriverConfig,
} from '@nestjs/apollo';
import {
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';

import { loadEnvVarConfig } from './config/EnvVarConfig';
import { apolloConfigFactory } from './gql/config/apollo.config';
import { IngredientModule } from './gql/ingredient/ingredient.module';
import { ReciepeModule } from './gql/reciepe/reciepe.module';
import { SupplierModule } from './gql/supplier/supplier.module';
import { UserModule } from './gql/user/user.module';
import { DbModule } from './internal/db/db.module';
import { ContextFillMiddleware } from './internal/middleware/context.middleware';
import { PubSubModule } from './internal/pubSub/pubSub.module';
import { RedisClientModule } from './internal/redis/redisClient.module';

@Module({
  imports: [
    DbModule,
    RedisClientModule,
    PubSubModule,

    CoreModule, // upload scalar
    RmqModule,
    // data
    UserModule,
    IngredientModule,
    IngredientPrice,
    SupplierModule,
    ReciepeModule,
    // data
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: apolloConfigFactory,
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
  ],
  controllers: [],
  providers: [UploadScalar],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextFillMiddleware).forRoutes('/api/*');
  }
}
