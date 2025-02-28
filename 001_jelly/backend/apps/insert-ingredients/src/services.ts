import { Repository } from 'typeorm';

import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { Supplier } from '@app/common/coreModels/models/supplier.entity';
import { SupplierToIngredient } from '@app/common/coreModels/models/supplierToIngredient.entity';
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

  findOneByName(name: string, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(Supplier, { where: { name }, relations, cache: true });
  }

  getManager() {
    return this.repo.manager;
  }
}

@Injectable()
export class IngredientService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Ingredient)
    private repo: Repository<Ingredient>
  ) { }

  findOneByName(name: string, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(Ingredient, { where: { name }, relations, cache: true });
  }

  insert(ingredient: Ingredient, entityManager = this.repo.manager) {
    return entityManager.save(Ingredient, ingredient);
  }

  // needs to abstracted out
  // time contrains
  getManager() {
    return this.repo.manager;
  }
}

@Injectable()
export class SupplierToIngredientService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(SupplierToIngredient)
    private repo: Repository<SupplierToIngredient>
  ) { }

  insert(supplierToIngredient: SupplierToIngredient, entityManager = this.repo.manager) {
    return entityManager.save(SupplierToIngredient, supplierToIngredient);
  }

  findOneBySupplierAndIngridient(
    supplierId: number,
    ingredientId: number,
    relations = [],
    entityManager = this.repo.manager
  ) {
    return entityManager.findOne(SupplierToIngredient, {
      where: { supplierId, ingredientId },
      relations,
      cache: true,
    });
  }

  getManager() {
    return this.repo.manager;
  }
}
