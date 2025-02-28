import { resolveFieldMap } from '@jenyus-org/graphql-utils';
import {
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const FieldMap = createParamDecorator((data: {}, context: ExecutionContext) => {
  const ctx = GqlExecutionContext.create(context);
  const info = ctx.getInfo();
  const fieldMap = resolveFieldMap(info, true, info.fieldName) || {};
  return fieldMap;
});
