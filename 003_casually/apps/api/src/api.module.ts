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
import { ArticlesModule } from './gql/article/article.module';
import { apolloConfigFactory } from './gql/config/apollo.config';
import { ElasticModule } from './internal/elastic/elastic.module';
import {
  ContextFillMiddleware,
} from './internal/middleware/context.middleware';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvVarConfig],
    }),
    ElasticModule,

    RestModule,
    ArticlesModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: apolloConfigFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextFillMiddleware).forRoutes('/api/*');
  }
}
