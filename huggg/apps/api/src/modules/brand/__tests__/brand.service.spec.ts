import {
    EntityManager,
    Repository,
} from 'typeorm';

import { Brand } from '@huggg/models/brand/brand.entity';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { BrandService } from '../brand.service';

describe('BrandService', () => {
    let service: BrandService;
    let repoMock: jest.Mocked<Repository<Brand>>;
    let entityManagerMock: jest.Mocked<EntityManager>;

    beforeEach(async () => {
        // Create mock implementations
        entityManagerMock = {
            // Add EntityManager methods as needed
        } as unknown as jest.Mocked<EntityManager>;

        repoMock = {
            manager: entityManagerMock,
            // Add Repository methods as needed
        } as unknown as jest.Mocked<Repository<Brand>>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BrandService,
                {
                    provide: getRepositoryToken(Brand),
                    useValue: repoMock,
                },
            ],
        }).compile();

        service = module.get<BrandService>(BrandService);
    });

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
});
