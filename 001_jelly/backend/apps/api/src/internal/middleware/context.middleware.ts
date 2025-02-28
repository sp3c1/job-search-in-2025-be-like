import { randomUUID } from 'crypto';
import {
  NextFunction,
  Request,
  Response,
} from 'express';
import { ExecutionContext } from 'graphql/execution/execute';

import { UserRole } from '@app/common/coreModels';
import {
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONTEXT } from '@nestjs/graphql';

import { IContext } from '../../gql/config/apollo.config';

@Injectable()
export class ContextFillMiddleware implements NestMiddleware {
  constructor(
    @Inject(CONTEXT) private context: IContext,
    @Inject(CONTEXT) private executionContext: ExecutionContext,
    @Inject(ConfigService) private config: ConfigService
  ) {}

  // hooking up datasources for webhooks (when request go through middleware)
  use(req: Request, res: Response, next: NextFunction) {
    const jwt = req.headers['authorization']?.split?.(' ')[1];
    const apiKey = String(req.headers['x-api-key'] ?? '');

    const webhookContext = <IContext>{
      id: randomUUID(),
      jwt,
      apiKey,
      user: {
        id: 0,
        role: UserRole.Unknown,
      },
    };

    (<any>req).webhookContext = webhookContext;

    next();
  }
}
