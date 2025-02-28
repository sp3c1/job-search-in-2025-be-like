import {
    Test,
    TestingModule,
} from '@nestjs/testing';

import { ProductService } from '../../product/product.service';
import { BrandController } from '../brand.controller';
import { BrandService } from '../brand.service';

describe('BrandController', () => {
    let controller: BrandController;
    let productServiceMock: Partial<Record<keyof ProductService, jest.Mock>>;
    let brandServiceMock: Partial<Record<keyof BrandService, jest.Mock>>;

    beforeEach(async () => {
        productServiceMock = {
            findPaginatedProductsForBrand: jest.fn(),
            countProductsForBrand: jest.fn(),
        };

        brandServiceMock = {
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [BrandController],
            providers: [
                { provide: ProductService, useValue: productServiceMock },
                { provide: BrandService, useValue: brandServiceMock },
            ],
        }).compile();

        controller = module.get<BrandController>(BrandController);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getProducts', () => {
        const brandId = '123e4567-e89b-12d3-a456-426614174000';
        const size = 20;
        const page = 1;

        it('should return products when found', async () => {
            const products = [{ id: 'prod1', name: 'Product 1' }];
            const total = 1;
            (productServiceMock.findPaginatedProductsForBrand as jest.Mock).mockResolvedValue(products);
            (productServiceMock.countProductsForBrand as jest.Mock).mockResolvedValue(total);

            const result = await controller.getProducts(brandId, size, page);

            expect(productServiceMock.findPaginatedProductsForBrand).toHaveBeenCalledWith(brandId, page, size);
            expect(productServiceMock.countProductsForBrand).toHaveBeenCalledWith(brandId);
            expect(result).toEqual({
                page,
                size,
                total,
                data: products,
            });
        });

        it('should throw 404 if no products found', async () => {
            (productServiceMock.findPaginatedProductsForBrand as jest.Mock).mockResolvedValue([]);
            (productServiceMock.countProductsForBrand as jest.Mock).mockResolvedValue(0);

            await expect(controller.getProducts(brandId, size, page)).rejects.toThrow();
        });

        it('should throw 500 if an error occurs in Promise.all', async () => {
            (productServiceMock.findPaginatedProductsForBrand as jest.Mock).mockRejectedValue(new Error('DB error'));
            (productServiceMock.countProductsForBrand as jest.Mock).mockResolvedValue(1);

            await expect(controller.getProducts(brandId, size, page)).rejects.toThrow();
        });
    });
});
