import {
    EntityManager,
    Repository,
} from 'typeorm';

import { Brand } from '@huggg/models/brand/brand.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BrandService {
    private entityManager: EntityManager;

    constructor(
        @InjectRepository(Brand)
        private repo: Repository<Brand>
    ) {
        this.entityManager = this.repo.manager;
    }


}
