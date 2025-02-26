import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import {
  Field,
  InputType,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class Pagination {
  @ApiProperty({
    required: false,
    description: 'page number',
    example: 1,
    default: 1,
    type: Number,
  })
  @Field((_) => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1)

  @Transform(({ value }) => parseInt(value, 10) || 1)
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    required: false,
    description: 'page size',
    example: 50,
    default: 50,
    type: Number,
  })
  @Field((_) => Int, { defaultValue: 50 })
  @IsInt()
  @Min(1)
  @Max(50) // Prevents abuse by capping page size
  @Transform(({ value }) => parseInt(value, 10) || 50)
  @IsOptional()
  size: number = 50;
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

// Elastic search Helper
export function paginationForElastic(pagination: Pagination) {
  return (
    pagination && {
      from: (pagination.page - 1) * pagination.size,
      size: pagination.size,
    }
  );
}
