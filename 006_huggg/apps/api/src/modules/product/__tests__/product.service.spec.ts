import {
  EntityManager,
  Repository,
} from 'typeorm';

import { Product } from '@huggg/models/product/product.entity';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CacheService } from '../../../internal/cache/service/cache.service';
import { ProductService } from '../product.service';

describe('ProductService', () => {
    let service: ProductService;
    let repoMock: jest.Mocked<Repository<Product>>;
    let entityManagerMock: jest.Mocked<EntityManager>;
    let cacheServiceMock: jest.Mocked<CacheService>;

    beforeEach(async () => {
        // Create mock implementations
        const mockQueryBuilder = {
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            getQuery: jest.fn().mockReturnValue('MOCKED_QUERY'),
            getCount: jest.fn().mockReturnValueOnce(1).mockReturnValueOnce(2),
        };

        entityManagerMock = {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
            query: jest.fn(),
        } as unknown as jest.Mocked<EntityManager>;

        repoMock = {
            manager: entityManagerMock,
        } as unknown as jest.Mocked<Repository<Product>>;

        cacheServiceMock = {
            makeHashKey: jest.fn(),
            get: jest.fn(),
            setex: jest.fn().mockImplementation(async () => { }),
        } as unknown as jest.Mocked<CacheService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductService,
                {
                    provide: getRepositoryToken(Product),
                    useValue: repoMock,
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceMock,
                },
            ],
        }).compile();

        service = module.get<ProductService>(ProductService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        jest.clearAllMocks();
    })

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize with repository', () => {
        expect(service['repo']).toBeDefined();
        expect(service['repo']).toBe(repoMock);
    });

    it('should initialize entityManager from repository', () => {
        expect(service['entityManager']).toBeDefined();
        expect(service['entityManager']).toBe(entityManagerMock);
    });

    describe('findPaginatedProductsForBrand', () => {
        it('should return cached products if available', async () => {
            const brandId = 'test-brand';
            const cachedProducts = [{ id: '1', name: 'Product 1' }];
            const cacheKey = 'test-cache-key';

            cacheServiceMock.makeHashKey.mockReturnValue(cacheKey);
            cacheServiceMock.get.mockResolvedValue(cachedProducts);

            const result = await service.findPaginatedProductsForBrand(brandId);

            expect(cacheServiceMock.makeHashKey).toBeCalledWith(
                'service',
                `brand_products_${brandId}_size_undefined_page_undefined`,
                { brandId, page: undefined, size: undefined }
            );
            expect(cacheServiceMock.get).toBeCalledWith(cacheKey);
            expect(result).toEqual(cachedProducts);
        });

        it('should query database and cache result when no cache', async () => {
            const brandId = 'test-brand';
            const products = [{ id: '1', name: 'Product 1' }];
            const cacheKey = 'test-cache-key';

            cacheServiceMock.makeHashKey.mockReturnValue(cacheKey);
            cacheServiceMock.get.mockResolvedValue(null);
            entityManagerMock.query.mockResolvedValue(products);

            const result = await service.findPaginatedProductsForBrand(brandId);

            expect(cacheServiceMock.setex).toBeCalledWith(cacheKey, products, 5);
            expect(result).toEqual(products);
        });
    });

    describe('countProductsForBrand', () => {
        it('should return cached count if available', async () => {
            const brandId = 'test-brand';
            const cachedCount = 10;
            const cacheKey = 'test-cache-key';

            cacheServiceMock.makeHashKey.mockReturnValue(cacheKey);
            cacheServiceMock.get.mockResolvedValue(cachedCount);

            const result = await service.countProductsForBrand(brandId);

            expect(cacheServiceMock.makeHashKey).toBeCalledWith(
                'service',
                `brand_products_count_${brandId}`,
                { brandId }
            );
            expect(cacheServiceMock.get).toBeCalledWith(cacheKey);
            expect(result).toEqual(cachedCount);
        });

        it('should query database and cache result when no cache', async () => {
            const brandId = 'test-brand';
            const count = 3;
            const cacheKey = 'test-cache-key';

            cacheServiceMock.makeHashKey.mockReturnValue(cacheKey);
            cacheServiceMock.get.mockResolvedValue(null);
            
            const result = await service.countProductsForBrand(brandId);

            expect(cacheServiceMock.setex).toBeCalledWith(cacheKey, 3, 5);
            expect(result).toEqual(count);
        });
    });
});
