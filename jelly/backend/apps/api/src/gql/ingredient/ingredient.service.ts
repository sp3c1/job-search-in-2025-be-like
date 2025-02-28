import { Repository } from 'typeorm';

import { Pagination } from '@app/common';
import { Ingredient } from '@app/common/coreModels/models/ingredient.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class IngredientService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Ingredient)
    private repo: Repository<Ingredient>
  ) { }

  insert(ingredient: Ingredient, entityManager = this.repo.manager) {
    return entityManager.save(Ingredient, ingredient);
  }

  findOneById(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(Ingredient, { where: { id }, relations });
  }

  findAll(pagination: Pagination, relations = [], entityManager = this.repo.manager) {
    return entityManager.find(Ingredient, {
      relations,
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
      order: {
        id: 'ASC',
      },
    });
  }
}
