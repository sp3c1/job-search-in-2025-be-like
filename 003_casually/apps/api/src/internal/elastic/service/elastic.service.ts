import { estypes } from '@elastic/elasticsearch';
import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export type SimplifiedSearchEsResponse<T> = { hits: { hits: { _source: T; _score?: number }[] } };
export type SearchRequestBody = Required<Pick<estypes.SearchRequest, 'body'>>['body'];


@Injectable()
export class ElasticService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly elasticsearchService: ElasticsearchService) { }

  onModuleInit() { }

  onModuleDestroy() { }

  search<T>(index, body: SearchRequestBody) {
    return this.elasticsearchService.search<SimplifiedSearchEsResponse<T>>({
      index,
      body,
    });
  }
}
