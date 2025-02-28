import {
  Field,
  Float,
  ObjectType,
} from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class Relationship {
  @ApiProperty({ description: 'Cause Concept Name' })
  @Field((_) => String)
  cause_concept_name: string;

  @ApiProperty({ description: 'Effect Concept Name' })
  @Field((_) => String)
  effect_concept_name: string;
}

@ObjectType()
export class Article {
  @ApiProperty({ description: 'UUID of the article' })
  @Field((_) => String)
  uuid: string;

  @ApiProperty({ description: 'Title for paper' })
  @Field((_) => String)
  title: string;

  @ApiProperty({ description: 'Abstract for paper' })
  @Field((_) => String)
  abstract: string;

  @ApiProperty({ description: 'Paper tags' })
  @Field((_) => [String])
  tags: string[];

  @ApiProperty({ description: 'Relationship array' })
  @Field((_) => [Relationship])
  relationships: Relationship[];

  @ApiProperty({ description: 'es ranking (if applicable)', nullable: true, required: false })
  @Field((_) => Float, { description: 'es ranking (if applicable)', nullable: true })
  score?: number;
}
