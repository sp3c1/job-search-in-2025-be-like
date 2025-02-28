// The common parts should extracted to @app/common package for use
// running out of time and will just create copy of those for now

import { Repository } from 'typeorm';

import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { IngredientPrice } from '@app/common/coreModels/models/ingredientPrice.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IngredientPriceService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(IngredientPrice)
    private repo: Repository<IngredientPrice>
  ) {}

  insert(supplier: IngredientPrice, entityManager = this.repo.manager) {
    return entityManager.save(supplier);
  }

  findLatestByIngredientId(
    ingredientId: number,
    relations = [],
    entityManager = this.repo.manager
  ) {
    return entityManager.findOne(IngredientPrice, {
      where: { ingredientId },
      relations,
      order: {
        changedAt: 'DESC',
      },
    });
  }

  // needs to abstracted out
  // time contrains
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
  ) {}

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
