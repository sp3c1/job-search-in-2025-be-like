import { randomUUID } from 'crypto';
import { join } from 'path';

import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';

import { always200Plugin } from '../plugins/always200.plugin';

const isProd = process.env.ACTIVE_PROFILE === 'production' || process.env.ACTIVE_PROFILE === 'prod';

const plugins = [always200Plugin];

if (isProd) {
  plugins.push(ApolloServerPluginLandingPageProductionDefault());
} else {
  plugins.push(ApolloServerPluginLandingPageLocalDefault());
}

export interface IContext {
  id: string;
  jwt?: string;
  apiKey?: string;
  user?: any;
}

export const apolloConfigFactory = async (configService: ConfigService) =>
  <any>{
    driver: ApolloDriver,
    cors: {
      origin: '*',
      credentials: true,
    },
    debug: !isProd,
    playground: false,
    introspection: !isProd,
    autoSchemaFile: join(process.cwd(), './schema/template.gql'),
    plugins,
    path: `/graphql`,
    formatError: (error) => {
      // handle errors - in production evrioment you might want to not throw stack traces
      // plays the same role as generic error middleware handler

      return error;
    },
    context: ({ req, res }) => {
      const reqID = randomUUID();

      try {
        const jwt = req.headers['authorization']?.split?.(' ')?.[1];
        const apiKey = String(req.headers['x-api-key'] ?? req.headers['x_api_key'] ?? '');

        return <IContext>{
          id: reqID,
          jwt,
          apiKey,
          user: {
            role: undefined,
          },
        };
      } catch (err) {
        return <IContext>{
          id: reqID,
          jwt: null,
          apiKey: null,
          user: {
            role: undefined,
          },
        };
      }
    },
  };
