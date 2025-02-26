import {
    EntityManager,
    Repository,
} from 'typeorm';

import { Store } from '@huggg/models/store/store.enitty';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CacheService } from '../../internal/cache/service/cache.service';

@Injectable()
export class StoreService {
    private entityManager: EntityManager;

    constructor(
        @InjectRepository(Store)
        private repo: Repository<Store>,
        private cacheService: CacheService
    ) {
        this.entityManager = this.repo.manager;
    }

    async findAllByProduct(productId: string, relations: string[] = [], page?: number, size?: number) {
        const take = size ? size : undefined;
        const skip = page && size ? (page - 1) * (size) : undefined;

        return this.entityManager.find(Store, {
            where: {
                productStores: {
                    product: {
                        id: productId
                    }
                }
            },
            relations,
            ...(skip !== undefined && { skip }),
            ...(take !== undefined && { take }),
            order: { id: 'ASC' },
            cache: 5000
        });
    }

    async countFindAllByProduct(productId: string) {
        return this.entityManager.count(Store, {
            where: {
                productStores: {
                    product: {
                        id: productId
                    }
                }
            },
            cache: 5000
        });
    }

}
