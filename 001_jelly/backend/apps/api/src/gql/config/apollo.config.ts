import { randomUUID } from 'crypto';
import { Context } from 'graphql-ws';
import { join } from 'path';

import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import { UserRole } from '@app/common/coreModels';
import { ApolloDriver } from '@nestjs/apollo';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DecodedUser } from '../../auth';
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
  user?: DecodedUser;
}

export const socketContextCreation = (ref, req = null) => {
  const jwt: string =
    ref?.AUTHORIZATION?.split?.(' ')?.[1] ||
    ref?.authorization?.split?.(' ')?.[1] ||
    ref?.Authorization?.split?.(' ')?.[1] ||
    '';

  const apiKey = String(ref?.['x-api-key'] || ref?.['X-Api-Key'] || ref?.['X-API-KEY'] || '');

  return <IContext>{
    id: randomUUID(),
    jwt,
    apiKey,
  };
};

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
    uploads: {
      maxFileSize: 10 * 1024 * 1024,
      maxFiles: 5,
    },
    plugins,
    path: `/graphql`,
    subscriptions: {
      'graphql-ws': {
        onConnect: (context: Context<any>) => {
          const { connectionParams, extra } = context;
          const ctx = socketContextCreation(connectionParams);
          (extra as any).graphqlWsContext = ctx;
          return context;
        },

        onDisconnect: (...args) => {
          // for the brave
        },
        onSubscribe: (ctx, msg) => {
          Logger.log(`subscriptions-graphql-ws`, {
            context: 'ApolloConfig',
            ctx: (<any>ctx?.extra)?.graphqlWsContext,
            msg,
            params: ctx.connectionParams,
          });
        },
        onClose: (...args) => {},
      },
    },
    formatError: (error) => {
      // handle errors

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
            role: UserRole.Unknown,
          },
        };
      } catch (err) {
        return <IContext>{
          id: reqID,
          jwt: null,
          apiKey: null,
          user: {
            role: UserRole.Unknown,
          },
        };
      }
    },
  };
