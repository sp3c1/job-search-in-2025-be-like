import {
    Test,
    TestingModule,
} from '@nestjs/testing';

import { CacheService } from '../../../internal/cache/service/cache.service';
import { StoreService } from '../../store/store.service';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';

describe('ProductController', () => {
    let controller: ProductController;
    let cacheServiceMock: Partial<Record<keyof CacheService, jest.Mock>>;
    let storeServiceMock: Partial<Record<keyof StoreService, jest.Mock>>;
    let productServiceMock: Partial<Record<keyof ProductService, jest.Mock>>;

    beforeEach(async () => {
        cacheServiceMock = {
            makeHashKey: jest.fn(),
            get: jest.fn(),
            setex: jest.fn().mockResolvedValue(undefined),
        };

        storeServiceMock = {
            findAllByProduct: jest.fn(),
            countFindAllByProduct: jest.fn(),
        };

        // ProductService is not used in getStores, so we can provide an empty mock.
        productServiceMock = {};

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductController],
            providers: [
                { provide: CacheService, useValue: cacheServiceMock },
                { provide: StoreService, useValue: storeServiceMock },
                { provide: ProductService, useValue: productServiceMock },
            ],
        }).compile();

        controller = module.get<ProductController>(ProductController);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getStores', () => {
        const productId = '123e4567-e89b-12d3-a456-426614174000';
        const size = 20;
        const page = 1;
        const key = 'some-hash-key';
        const responseData = { page, size, total: 10, data: [{ id: 'store-1' }] };

        it('should return cached response if available', async () => {
            // Simulate cache key creation and cache hit.
            (cacheServiceMock.makeHashKey as jest.Mock).mockReturnValue(key);
            (cacheServiceMock.get as jest.Mock).mockResolvedValue(responseData);

            const result = await controller.getStores(productId, size, page);

            expect(cacheServiceMock.makeHashKey).toHaveBeenCalledWith(
                'http:rest',
                `v1/product/${productId}/store`,
                { productId, size, page }
            );
            expect(cacheServiceMock.get).toHaveBeenCalledWith(key);
            expect(result).toEqual(responseData);
            // When cache hit, setex is not called.
            expect(cacheServiceMock.setex).not.toHaveBeenCalled();
        });

        it('should query storeService and cache result when no cached value', async () => {
            // No cache hit: get returns null.
            (cacheServiceMock.makeHashKey as jest.Mock).mockReturnValue(key);
            (cacheServiceMock.get as jest.Mock).mockResolvedValue(null);

            const stores = [{ id: 'store-1' }];
            (storeServiceMock.findAllByProduct as jest.Mock).mockResolvedValue(stores);
            (storeServiceMock.countFindAllByProduct as jest.Mock).mockResolvedValue(10);

            const result = await controller.getStores(productId, size, page);

            expect(storeServiceMock.findAllByProduct).toHaveBeenCalledWith(productId, [], page, size);
            expect(storeServiceMock.countFindAllByProduct).toHaveBeenCalledWith(productId);

            expect(cacheServiceMock.setex).toHaveBeenCalledWith(key, {
                page,
                size,
                total: 10,
                data: stores,
            }, 5);

            expect(result).toEqual({
                page,
                size,
                total: 10,
                data: stores,
            });
        });

        it('should throw 404 when total and stores are empty', async () => {
            (cacheServiceMock.makeHashKey as jest.Mock).mockReturnValue(key);
            (cacheServiceMock.get as jest.Mock).mockResolvedValue(null);

            (storeServiceMock.findAllByProduct as jest.Mock).mockResolvedValue([]);
            (storeServiceMock.countFindAllByProduct as jest.Mock).mockResolvedValue(0);

            await expect(controller.getStores(productId, size, page)).rejects.toThrow();
        });

        it('should throw 500 when an error occurs in the Promise.all', async () => {
            (cacheServiceMock.makeHashKey as jest.Mock).mockReturnValue(key);
            (cacheServiceMock.get as jest.Mock).mockResolvedValue(null);

            // Simulate an error during one of the Promise.all calls.
            (storeServiceMock.findAllByProduct as jest.Mock).mockRejectedValue(new Error('DB error'));
            (storeServiceMock.countFindAllByProduct as jest.Mock).mockResolvedValue(10);

            await expect(controller.getStores(productId, size, page)).rejects.toThrow();
        });
    });
});
