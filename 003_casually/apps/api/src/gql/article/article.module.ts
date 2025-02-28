import {
  forwardRef,
  Module,
} from '@nestjs/common';

import { ElasticModule } from '../../internal/elastic/elastic.module';
import { ArticleResolver } from './article.resolver';
import { ArticleService } from './article.service';

@Module({
  imports: [forwardRef(() => ElasticModule)],
  controllers: [],
  providers: [ArticleService, ArticleResolver],
  exports: [ArticleService],
})
export class ArticlesModule {}
