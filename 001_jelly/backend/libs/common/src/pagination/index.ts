import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class Pagination {
  @Field((_) => Int, { defaultValue: 1 })
  page: number;

  @Field((_) => Int, { defaultValue: 50 })
  size: number;
}

@ObjectType()
export class PaginationOutput {
  @Field((_) => Int, { defaultValue: 1 })
  page: number;

  @Field((_) => Int, { defaultValue: 50 })
  size: number;

  @Field((_) => Int, { defaultValue: 0 })
  count: number;
}
