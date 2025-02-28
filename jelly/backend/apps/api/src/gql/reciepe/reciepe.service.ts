import { Repository } from 'typeorm';

import { Pagination } from '@app/common';
import { Reciepie } from '@app/common/coreModels/models/reciepe.entity';
import { ReciepieToIngredient } from '@app/common/coreModels/models/reciepeToIngredient.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ReciepieService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Reciepie)
    private repo: Repository<Reciepie>
  ) {}

  save(user: Reciepie, entityManager = this.repo.manager) {
    return entityManager.save(user);
  }

  findAll(pagination: Pagination, relations = [], entityManager = this.repo.manager) {
    return entityManager.find(Reciepie, {
      relations,
      skip: (pagination.page - 1) * pagination.size,
      take: pagination.size,
    });
  }

  findOneById(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.findOne(Reciepie, { where: { id }, relations });
  }

  remove(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.softDelete(Reciepie, { where: { id }, relations });
  }
}

@Injectable()
export class ReciepieToIngredientService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(ReciepieToIngredient)
    private repo: Repository<ReciepieToIngredient>
  ) {}

  findOneByReciepeIdIngredientId(
    reciepeId: number,
    ingredientId: number,
    relations = [],
    entityManager = this.repo.manager
  ) {
    return entityManager.findOne(ReciepieToIngredient, {
      where: { reciepeId, ingredientId },
      relations,
    });
  }

  save(target: ReciepieToIngredient, entityManager = this.repo.manager) {
    return entityManager.save(target);
  }

  insertMultiple(target: ReciepieToIngredient[], entityManager = this.repo.manager) {
    return entityManager.save(target);
  }

  delete(reciepeId: number, ingredientId: number, entityManager = this.repo.manager) {
    return entityManager.delete(ReciepieToIngredient, { reciepeId, ingredientId });
  }
}
