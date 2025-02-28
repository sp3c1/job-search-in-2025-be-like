import { verify } from 'jsonwebtoken';
import { uniq } from 'lodash';

import { UserRole } from '@app/common/coreModels';
import {
  AuthenticationError,
  ForbiddenError,
} from '@nestjs/apollo';
import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { IAppConfig } from '../config/load/config.interface';

export interface DecodedUser {
  id: number;
  role: UserRole;
}

export enum AllowedRoles {
  All = 'all',
  Business = 'business',
  User = 'user',
  Admin = 'admin',
}

function MapAllowedRoles(schemaRoles: AllowedRoles): UserRole[] {
  switch (schemaRoles) {
    case AllowedRoles.Business:
      return [UserRole.ApiKey, UserRole.Admin, UserRole.Business];

    case AllowedRoles.All:
      return [UserRole.ApiKey, UserRole.Business, UserRole.User, UserRole.Admin];

    case AllowedRoles.Admin:
      return [UserRole.ApiKey, UserRole.Admin];

    case AllowedRoles.User:
      return [UserRole.ApiKey, UserRole.Admin, UserRole.User];
  }

  // just in case
  return [];
}

function MergeAllowedRoles(allowedRoles: AllowedRoles[]): UserRole[] {
  const target = [];

  for (const roles of allowedRoles) {
    target.push(...MapAllowedRoles(roles));
  }

  return uniq(target);
}

function mapRole(role: string): UserRole {
  switch (role) {
    case 'apikey':
      return UserRole.ApiKey;
    case 'admin':
      return UserRole.Admin;
    case 'business':
      return UserRole.Business;
    case 'user':
      return UserRole.User;
  }

  return UserRole.Unknown;
}

export function Roles(roles: AllowedRoles[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RoleGuard));
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector, private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<AllowedRoles[]>('roles', context.getHandler());

    const ctx = GqlExecutionContext.create(context);
    const tmpCtx = ctx.getContext();

    let localCtx = tmpCtx;

    if (<DecodedUser>tmpCtx.req?.webhookContext) {
      localCtx = <DecodedUser>tmpCtx.req?.webhookContext;
    } else if (<DecodedUser>tmpCtx.req?.extra?.graphqlWsContext) {
      localCtx = <DecodedUser>tmpCtx.req.extra.graphqlWsContext;
    }

    const config = this.configService.get<IAppConfig>('app');

    if (localCtx.apiKey) {
      if (localCtx.apiKey != config.AUTH.API_KEY) {
        throw new AuthenticationError('API-KEY failue');
      }

      localCtx.user = <DecodedUser>{
        id: 0,
        role: UserRole.ApiKey,
      };
    }

    // if admin was assigned do not override
    if (localCtx.jwt && localCtx.user.role == UserRole.Unknown) {
      try {
        const local = verify(localCtx.jwt, config.AUTH.SECRET) as {
          id?: number;
          role?: string;
        };

        localCtx.user = <DecodedUser>{
          id: local.id,
          role: mapRole(local.role),
        };
      } catch (err) {
        throw new AuthenticationError('JWT failure');
      }
    }

    if (roles?.length > 0) {
      const allowedRoles = MergeAllowedRoles(roles);

      const hasRole = allowedRoles.includes(localCtx?.user?.role);

      if (!hasRole) {
        throw new ForbiddenError(`Role ${localCtx?.user?.role} not allowed in context`);
      }
    }

    return true;
  }
}
