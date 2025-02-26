import { Store } from '@huggg/models/store/store.enitty';
import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheModule } from '../../internal/cache/cache.module';
import { StoreService } from './store.service';

@Module({
  imports: [
    forwardRef(() => CacheModule),
    TypeOrmModule.forFeature([Store])
  ],
  providers: [StoreService],
  exports: [StoreService]
})
export class StoreModule { }
