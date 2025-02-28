import { HttpEndpoint } from 'nestjs-typebox';

import {
    defaultSizeInput,
    defualtPageInput,
    PaginatedResponse,
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

import { ProductService } from '../product/product.service';
import { ProductSchemaBase } from '../product/types/product.dto';
import { BrandService } from './brand.service';

@ApiTags('Brand')
@Controller('v1/brand')
export class BrandController {
    constructor(private readonly brandService: BrandService, private readonly productService: ProductService) { }

    @HttpEndpoint({
        method: 'GET',
        path: ':brandId/product',
        validate: {
            response: PaginatedResponse(ProductSchemaBase),
            request: [
                { name: 'brandId', type: 'param', schema: Type.String({ format: 'uuid' }) },
                { name: 'size', type: 'query', schema: Type.Optional(defaultSizeInput) },
                { name: 'page', type: 'query', schema: Type.Optional(defualtPageInput) },
            ],
        },
    })
    @ApiOperation({ summary: 'Get all product entities for a brand by brand-id' })
    @ApiResponse({
        status: 200, description: 'Paginated products', schema: {
            type: 'object',
            properties: {
                page: { type: 'number' },
                size: { type: 'number' },
                total: { type: 'number' },
                data: {
                    type: 'array',
                    items: { $ref: getSchemaPath('ProductSchemaBase') }
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
    async getProducts(
        @Param('brandId') brandId: string,
        @Query('size') size = 20,
        @Query('page') page = 1
    ) {
        // V2 for demo caching moved on the level of service
        let products = [];
        let total = 0;

        await Promise.all([
            (async () => {
                products = await this.productService.findPaginatedProductsForBrand(brandId, page, size);
            })(),
            (async () => {
                total = await this.productService.countProductsForBrand(brandId);
            })(),
        ]).catch(error => {
            // throw 500
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: `Could not process request for brandId: ${brandId}`,
            }, HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: error
            });
        });

        if (total === 0 && products?.length === 0) {
            // throw 404
            throw new HttpException({
                status: HttpStatus.NOT_FOUND,
                error: `Missing product for ${brandId}`,
            }, HttpStatus.NOT_FOUND, {
                cause: new Error(`Missing product for brandId: ${brandId}`)
            });
        }

        return {
            page,
            size,
            total,
            data: products || []
        };

    }
}
