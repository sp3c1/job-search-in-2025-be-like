// The common parts should extracted to @app/common package for use
// running out of time and will just create copy of those for now

import { Repository } from 'typeorm';

import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
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
  ) {}

  insert(supplier: Supplier, entityManager = this.repo.manager) {
    return entityManager.save(supplier);
  }

  findOneById(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(Supplier, { where: { id }, relations });
  }
}

@Injectable()
export class IngredientService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Ingredient)
    private repo: Repository<Ingredient>
  ) {}

  insert(ingredient: Ingredient, entityManager = this.repo.manager) {
    return entityManager.save(Ingredient, ingredient);
  }

  findOneById(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(Ingredient, { where: { id }, relations });
  }
}
