import { Brand } from '@huggg/models/brand/brand.entity';
import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductModule } from '../product/product.module';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Brand]),
    forwardRef(() => ProductModule)
  ],
  providers: [BrandService],
  controllers: [BrandController]
})
export class BrandModule { }
