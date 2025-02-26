import { HttpEndpoint } from 'nestjs-typebox';

import {
    defaultSizeInput,
    defualtPageInput,
    PaginatedResponse,
    PaginatedResponseType,
} from '@huggg/models';
import {
    Controller,
    HttpException,
    HttpStatus,
    Param,
    Query,
} from '@nestjs/common';
import {
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger';
import { Type } from '@sinclair/typebox';

import { CacheService } from '../../internal/cache/service/cache.service';
import { StoreService } from '../store/store.service';
import {
    deseliarizerStore,
    StoreSchema,
    StoreSchemaBase,
} from '../store/types/store.dto';
import { ProductService } from './product.service';

@ApiTags('Product')
@Controller('v1/product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly storeService: StoreService,
        private cacheService: CacheService
    ) { }

    @HttpEndpoint({
        method: 'GET',
        path: ':productId/store',
        validate: {
            response: PaginatedResponse(StoreSchemaBase),
            request: [
                { name: 'productId', type: 'param', schema: Type.String({ format: 'uuid' }) },
                { name: 'size', type: 'query', schema: Type.Optional(defaultSizeInput) },
                { name: 'page', type: 'query', schema: Type.Optional(defualtPageInput) },
            ],
        },
    })
    @ApiOperation({ summary: 'Get all stores for a product' })
    @ApiResponse({
        status: 200, description: 'Paginated stores', schema: {
            type: 'object',
            properties: {
                page: { type: 'number' },
                size: { type: 'number' },
                total: { type: 'number' },
                data: {
                    type: 'array',
                    items: { $ref: getSchemaPath('StoreSchemaBase') }
                }
            }
        }
    })
    @ApiQuery({
        name: 'size',
        required: false,
        type: Number,
        description: 'Size of pagination',
        example: 20,
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page of pagination',
        example: 1,
    })
    async getStores(
        @Param('productId') productId: string,
        @Query('size') size = 20,
        @Query('page') page = 1
    ) {
        const key = this.cacheService.makeHashKey(`http:rest`, `v1/product/${productId}/store`, { productId, size, page });
        const cacheResponse = <PaginatedResponseType<StoreSchema>>await this.cacheService.get(key).catch(_ => {
            return null;
        });

        if (cacheResponse) {
            cacheResponse.data = cacheResponse.data.map(store => deseliarizerStore(store));
            return cacheResponse;
        }

        let stores = [];
        let total = 0;

        await Promise.all([
            (async () => {
                stores = await this.storeService.findAllByProduct(productId, [], page, size);
            })(),
            (async () => {
                total = await this.storeService.countFindAllByProduct(productId);
            })(),
        ]).catch(error => {
            // throw 500
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Could not process request for productId: ${productId}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: error
            });
        })

        if (total === 0 && stores?.length === 0) {
            // throw 404
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: `Missing product for productId: ${productId}`,
            }, HttpStatus.NOT_FOUND, {
                cause: new Error(`Missing product for productId: ${productId}`)
            });
        }

        const response = {
            page,
            size,
            total,
            data: stores || []
        };

        this.cacheService.setex(key, response, 5).catch(); // fire and forget
        return response;
    }
}
