import { Product } from '@huggg/models/product/product.entity';
import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CacheModule } from '../../internal/cache/cache.module';
import { StoreModule } from '../store/store.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    forwardRef(() => CacheModule),
    TypeOrmModule.forFeature([Product]),
    forwardRef(() => StoreModule)
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService]
})
export class ProductModule { }
