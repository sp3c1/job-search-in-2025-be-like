import { Repository } from 'typeorm';

import { Pagination } from '@app/common';
import { Supplier } from '@app/common/coreModels/models/supplier.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SupplierService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Supplier)
    private repo: Repository<Supplier>
  ) { }

  insert(supplier: Supplier, entityManager = this.repo.manager) {
    return entityManager.save(supplier);
  }

  findOneById(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(Supplier, { where: { id }, relations });
  }

  findAll(pagination: Pagination, relations = [], entityManager = this.repo.manager) {
    return entityManager.find(Supplier, {
      relations,
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      order: {
        id: 'ASC',
      },
    });
  }
}
