import { Article } from '@app/causaly';
import {
  Pagination,
  paginationForElastic,
} from '@app/common';
import { Injectable } from '@nestjs/common';

import { ElasticService } from '../../internal/elastic/service/elastic.service';

@Injectable()
export class ArticleService {
  private readonly index = 'articles';
  constructor(private readonly elasticsearchService: ElasticService) { }

  async getAllArticles(pagination?: Pagination) {
    const response = await this.elasticsearchService.search<Article>(this.index, {
      query: {
        match_all: {},
      },
      sort: [{ uuid: 'asc' }],
      ...paginationForElastic(pagination),
    });

    return response?.body?.hits?.hits.map((hit) => hit._source) ?? [];
  }

  async getArticlesByKeyword(searchTerm: string, pagination?: Pagination) {
    const cleaned = `${searchTerm}`;

    const response = await this.elasticsearchService.search<Article>(this.index,
      {
        query: {
          function_score: {
            query: {
              nested: {
                path: 'relationships',
                query: {
                  term: {
                    'relationships.cause_concept_name': {
                      value: cleaned,
                    },
                  },
                },
              },
            },
            functions: [
              {
                filter: {
                  match: {
                    title: cleaned,
                  },
                },
                weight: 1,
              },
              {
                filter: {
                  match: {
                    tags: cleaned,
                  },
                },
                weight: 0.51,
              },
              {
                filter: {
                  match: {
                    abstract: cleaned,
                  },
                },
                weight: 0.1,
              },
            ],
            score_mode: 'sum',
            boost_mode: 'replace',
          },
        },
        sort: [{ _score: 'desc' } as any, { uuid: 'asc' }],
        ...paginationForElastic(pagination),
      }
    );

    return (
      response?.body?.hits?.hits.map((hit) => ({
        ...hit._source,
        score: hit._score, // Include the score
      })) ?? []
    );
  }
}
