import { Transform } from 'class-transformer';
import {
  IsString,
  Length,
} from 'class-validator';

import { Article } from '@app/causaly';
import { Pagination } from '@app/common';
import {
  Controller,
  Get,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiProperty,
  ApiResponse,
} from '@nestjs/swagger';

import { ArticleService } from '../gql/article/article.service';

export class SearchTermDto {
  @ApiProperty({
    description: 'Search term',
    example: 'coffee',
  })
  @IsString()
  @Length(1, 100) // Prevent empty string & set max length
  @Transform(({ value }) => value.trim().replace(/[^a-zA-Z0-9_\-\s]/g, '')) // Sanitize input
  searchTerm: string;
}

@Controller('api')
@UsePipes(new ValidationPipe({ transform: true }))
export class RestController {
  constructor(private articleService: ArticleService) { }

  @Get('articles')
  @ApiResponse({
    status: 200,
    type: [Article],
    example: [
      <Article>{
        abstract: 'Coffee is great, seriously',
        relationships: [
          {
            cause_concept_name: 'coffee cause greatnest',
            effect_concept_name: 'coffer effect concept',
          },
        ],
        tags: ['coffee', 'api'],
        title: 'Coffee is great',
        uuid: '11111-1111-111',
      },
    ],
  })
  async articles(
    @Query() pagination: Pagination
  ): Promise<Article[]> {
    return this.articleService.getAllArticles(pagination);
  }

  @Get('articles/:searchTerm')
  @ApiResponse({
    status: 200,
    type: [Article],
    example: [
      <Article>{
        abstract: 'Coffee is great, seriously',
        relationships: [
          {
            cause_concept_name: 'coffee cause greatnest',
            effect_concept_name: 'coffer effect concept',
          },
        ],
        tags: ['coffee', 'api'],
        title: 'Coffee is great',
        uuid: '11111-1111-111',
        score: 1.4,
      },
    ],
  })
  async articlesByTerm(
    @Param() params: SearchTermDto,
    @Query() pagination: Pagination
  ): Promise<Article[]> {
    return this.articleService.getArticlesByKeyword(params.searchTerm, pagination);
  }
}
