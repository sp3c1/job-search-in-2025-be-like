import {
    EntityManager,
    Repository,
} from 'typeorm';

import { Store } from '@huggg/models/store/store.enitty';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CacheService } from '../../../internal/cache/service/cache.service';
import { StoreService } from '../store.service';

describe('StoreService', () => {
    let service: StoreService;
    let repoMock: jest.Mocked<Repository<Store>>;
    let entityManagerMock: jest.Mocked<EntityManager>;
    let cacheServiceMock: jest.Mocked<CacheService>;

    beforeEach(async () => {
        // Create a mock for entityManager with find and count methods.
        entityManagerMock = {
            find: jest.fn(),
            count: jest.fn(),
        } as unknown as jest.Mocked<EntityManager>;

        // Create a repository mock that exposes the entityManager.
        repoMock = {
            manager: entityManagerMock,
        } as unknown as jest.Mocked<Repository<Store>>;

        // Create a dummy cacheService mock (StoreService doesn't use it directly).
        cacheServiceMock = {} as unknown as jest.Mocked<CacheService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StoreService,
                {
                    provide: getRepositoryToken(Store),
                    useValue: repoMock,
                },
                {
                    provide: CacheService,
                    useValue: cacheServiceMock,
                },
            ],
        }).compile();

        service = module.get<StoreService>(StoreService);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllByProduct', () => {
        it('should call entityManager.find with correct parameters when no pagination provided', async () => {
            const productId = 'prod1';
            const expectedStores = [{ id: 'store1' }];
            entityManagerMock.find.mockResolvedValue(expectedStores);

            const relations = ['relation1'];
            const result = await service.findAllByProduct(productId, relations);

            expect(entityManagerMock.find).toHaveBeenCalledWith(Store, {
                where: {
                    productStores: {
                        product: { id: productId },
                    },
                },
                relations,
                cache: 5000,
                order: { id: "ASC" }
            });
            expect(result).toEqual(expectedStores);
        });

        it('should call entityManager.find with pagination parameters', async () => {
            const productId = 'prod1';
            const expectedStores = [{ id: 'store1' }, { id: 'store2' }];
            entityManagerMock.find.mockResolvedValue(expectedStores);

            // Using page=2 and size=10 should set skip to 10 and take to 10.
            const page = 2;
            const size = 10;
            const result = await service.findAllByProduct(productId, [], page, size);

            expect(entityManagerMock.find).toHaveBeenCalledWith(Store, {
                where: {
                    productStores: {
                        product: { id: productId },
                    },
                },
                relations: [],
                skip: 10,
                take: 10,
                cache: 5000,
                order: { id: "ASC" }
            });
            expect(result).toEqual(expectedStores);
        });
    });

    describe('countFindAllByProduct', () => {
        it('should call entityManager.count with correct parameters and return count', async () => {
            const productId = 'prod1';
            const expectedCount = 5;
            entityManagerMock.count.mockResolvedValue(expectedCount);

            const result = await service.countFindAllByProduct(productId);

            expect(entityManagerMock.count).toHaveBeenCalledWith(Store, {
                where: {
                    productStores: {
                        product: { id: productId },
                    },
                },
                cache: 5000,
            });
            expect(result).toEqual(expectedCount);
        });
    });
});
