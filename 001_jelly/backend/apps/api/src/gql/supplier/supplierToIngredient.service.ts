import { Repository } from 'typeorm';

import { Pagination } from '@app/common';
import { SupplierToIngredient } from '@app/common/coreModels/models/supplierToIngredient.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SupplierToIngredientService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(SupplierToIngredient)
    private repo: Repository<SupplierToIngredient>
  ) { }

  insert(supplier: SupplierToIngredient, entityManager = this.repo.manager) {
    return entityManager.save(supplier);
  }

  findBySupplierId(
    supplierId: number,
    pagination: Pagination,
    relations = [],
    entityManager = this.repo.manager
  ) {
    return entityManager.find(SupplierToIngredient, {
      where: { supplierId },
      relations,
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      order: {
        supplierId: 'ASC',
      },
    });
  }

  findByIngredientId(
    ingredientId: number,
    pagination: Pagination,
    relations = [],
    entityManager = this.repo.manager
  ) {
    return entityManager.find(SupplierToIngredient, {
      where: { ingredientId },
      relations,
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      order: {
        ingredientId: 'ASC',
      },
    });
  }
}
