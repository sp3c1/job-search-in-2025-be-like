import {
  Transform,
  Type,
} from 'class-transformer';
import {
  Length,
  ValidateNested,
} from 'class-validator';

import { Article } from '@app/causaly';
import { Pagination } from '@app/common';
import {
  Args,
  ArgsType,
  Field,
  Query,
  Resolver,
} from '@nestjs/graphql';

import { ArticleService } from './article.service';

@ArgsType()
class ArgsGetArticles {
  @Field((_) => String, { nullable: true, description: "from 2 - 50 charactes, trimmed to alphanumeric" })
  @Length(2, 50)
  @Transform(({ value }) => value.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '')
  )
  keyword?: string;

  @Field((_) => Pagination, { defaultValue: { size: 50, page: 1 } })
  @ValidateNested()
  @Type(() => Pagination)
  pagination: Pagination;
}

@Resolver()
export class ArticleResolver {
  constructor(private readonly articlesService: ArticleService) { }

  @Query((_) => [Article])
  articles(@Args() { keyword, pagination }: ArgsGetArticles) {
    if (keyword) {
      return this.articlesService.getArticlesByKeyword(keyword, pagination);
    }

    return this.articlesService.getAllArticles(pagination);
  }
}
