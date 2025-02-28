import { Redis } from 'ioredis';

import {
    Test,
    TestingModule,
} from '@nestjs/testing';

import { RedisService } from '../../redis/service/redisService.service';
import { CacheService } from '../service/cache.service';

describe('CacheService', () => {
    let service: CacheService;
    let redisService: jest.Mocked<RedisService>;
    let redisClient: jest.Mocked<Redis>;

    beforeEach(async () => {
        redisClient = {
            get: jest.fn(),
            setex: jest.fn(),
            del: jest.fn(),
        } as unknown as jest.Mocked<Redis>;

        redisService = {
            getClient: jest.fn().mockReturnValue(redisClient),
        } as unknown as jest.Mocked<RedisService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CacheService,
                { provide: RedisService, useValue: redisService },
            ],
        }).compile();

        service = module.get<CacheService>(CacheService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('makeHashKey', () => {
        it('should generate consistent hash keys', () => {
            const key1 = service.makeHashKey('test', 'key', { param: 'value' });
            const key2 = service.makeHashKey('test', 'key', { param: 'value' });
            expect(key1).toEqual(key2);
        });
    });

    describe('get', () => {
        it('should return cached value', async () => {
            redisClient.get.mockResolvedValue('{"data":"value"}');
            const result = await service.get('test-key');
            expect(result).toEqual({ data: 'value' });
        });
    });
});
