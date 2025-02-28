import { Repository } from 'typeorm';

import { User } from '@app/common/coreModels';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private repo: Repository<User>
  ) {}

  insert(user: User, entityManager = this.repo.manager) {
    return entityManager.save(user);
  }

  findOneById(id: number, relations = [], entityManager = this.repo.manager) {
    return entityManager.find(User, { where: { id }, relations });
  }
}
