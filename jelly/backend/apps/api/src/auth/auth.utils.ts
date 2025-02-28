import { UserRole } from '@app/common/coreModels';

import { DecodedUser } from './role-guard';

export interface DbObjectWithOwner {
  userId?: number;
}

export function isAdmin(userFromContext: DecodedUser): boolean {
  return userFromContext?.role === UserRole.Admin || userFromContext?.role === UserRole.ApiKey;
}

export function isUserOwner(dbObject: DbObjectWithOwner, userFromContext: DecodedUser): boolean {
  return dbObject?.userId === userFromContext.id;
}
