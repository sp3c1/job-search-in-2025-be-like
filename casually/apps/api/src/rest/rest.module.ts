import {
  forwardRef,
  Module,
} from '@nestjs/common';

import { ArticlesModule } from '../gql/article/article.module';
import { RestController } from './rest.controller';

@Module({
  imports: [forwardRef(() => ArticlesModule)],
  controllers: [RestController],
  providers: [],
})
export class RestModule {}
