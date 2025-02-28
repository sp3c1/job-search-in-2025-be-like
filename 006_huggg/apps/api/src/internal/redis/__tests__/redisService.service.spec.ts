import { ConfigModule } from '@nestjs/config';
import {
    Test,
    TestingModule,
} from '@nestjs/testing';

import { loadEnvVarConfig } from '../../../config/EnvVarConfig';
import { RedisService } from '../service/redisService.service';

// Create a redis client mock
const redisClientMock = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    on: jest.fn(),
    quit: jest.fn(),
    ping: jest.fn(),
};

jest.mock('ioredis', () => {
    return {
        __esModule: true,
        default: class Redis {
            constructor(options: any) {
                return redisClientMock;
            }
        },
    };
});

describe('RedisService', () => {
    let service: RedisService;

    beforeEach(async () => {
        jest.clearAllMocks(); // Clear call history before each test

        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    load: [loadEnvVarConfig],
                }),
            ],
            providers: [RedisService],
        }).compile();

        service = module.get<RedisService>(RedisService);
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

    describe('getClient', () => {
        it('should return the mocked redis client', () => {
            const client = service.getClient();
            expect(client).toBe(redisClientMock);
        });
    });
});
