import { Repository } from 'typeorm';

import { Pagination } from '@app/common';
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

  insert(ingredientPrice: IngredientPrice, entityManager = this.repo.manager) {
    return entityManager.save(IngredientPrice, ingredientPrice);
  }

  findOneById(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(IngredientPrice, { where: { id }, relations });
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

  findAllByIngredientId(
    ingredientId: number,
    pagination: Pagination,
    relations = [],
    entityManager = this.repo.manager
  ) {
    return entityManager.find(IngredientPrice, {
      where: { ingredientId },
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      relations,
      order: {
        changedAt: 'DESC',
      },
    });
  }
}
