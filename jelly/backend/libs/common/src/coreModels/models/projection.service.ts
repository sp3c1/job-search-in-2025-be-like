import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectionService {
  private _check(obj, relations: string[], map, prefix, cnt, limit, key, func) {
    if (obj[key]) {
      const localPrefix = cnt == 0 ? `${key}` : `${prefix}.${key}`;
      relations.push(localPrefix);
      func(obj[key], relations, map, localPrefix, cnt + 1, limit);
    }
  }

  detectLoop(relationMap, key) {
    switch (key) {
      default:
        if (relationMap[key] >= 3) {
          throw new Error(
            `Circular or repetitive query detected [${key}:${relationMap[key]}], please change your query to include an object type just once`
          );
        }
        break;
    }

    if (!relationMap[key]) {
      relationMap[key] = 0;
    }
    relationMap[key]++;
  }

  removePrefix(fieldMap: any, prefix: string): any {
    if (!fieldMap) {
      return fieldMap;
    }

    if (fieldMap[prefix]) {
      return fieldMap[prefix];
    }

    return fieldMap;
  }

  user(obj, relations: string[] = [], map = {}, prefix = '', cnt = 0, limit = 10) {
    if (cnt >= limit) {
      return;
    }
    this.detectLoop(map, `user`);

    // this._check(obj, relations, map, prefix, cnt, limit, `profile`, this.profile.bind(this));

    return relations;
  }

  ingredient(obj, relations: string[] = [], map = {}, prefix = '', cnt = 0, limit = 10) {
    if (cnt >= limit) {
      return;
    }
    this.detectLoop(map, `ingredient`);

    this._check(
      obj,
      relations,
      map,
      prefix,
      cnt,
      limit,
      `reciepeToIngredient`,
      this.reciepeToIngredient.bind(this)
    );

    return relations;
  }

  supplier(obj, relations: string[] = [], map = {}, prefix = '', cnt = 0, limit = 10) {
    if (cnt >= limit) {
      return;
    }
    this.detectLoop(map, `supplier`);

    // this._check(
    //   obj,
    //   relations,
    //   map,
    //   prefix,
    //   cnt,
    //   limit,
    //   `supplierToIngredient`,
    //   this.supplierToIngredient.bind(this)
    // );
    return relations;
  }

  reciepe(obj, relations: string[] = [], map = {}, prefix = '', cnt = 0, limit = 10) {
    if (cnt >= limit) {
      return;
    }
    this.detectLoop(map, `reciepe`);

    this._check(
      obj,
      relations,
      map,
      prefix,
      cnt,
      limit,
      `reciepeToIngredient`,
      this.reciepeToIngredient.bind(this)
    );
    return relations;
  }

  reciepeToIngredient(obj, relations: string[] = [], map = {}, prefix = '', cnt = 0, limit = 10) {
    if (cnt >= limit) {
      return;
    }
    this.detectLoop(map, `usesupplierToIngredientr`);

    this._check(obj, relations, map, prefix, cnt, limit, `reciepe`, this.reciepe.bind(this));
    this._check(obj, relations, map, prefix, cnt, limit, `ingredient`, this.ingredient.bind(this));

    return relations;
  }

  supplierToIngredient(obj, relations: string[] = [], map = {}, prefix = '', cnt = 0, limit = 10) {
    if (cnt >= limit) {
      return;
    }
    this.detectLoop(map, `usesupplierToIngredientr`);

    this._check(obj, relations, map, prefix, cnt, limit, `supplier`, this.supplier.bind(this));
    this._check(obj, relations, map, prefix, cnt, limit, `ingredient`, this.ingredient.bind(this));

    return relations;
  }

  ingredientPrice(obj, relations: string[] = [], map = {}, prefix = '', cnt = 0, limit = 10) {
    if (cnt >= limit) {
      return;
    }
    this.detectLoop(map, `ingredientPrice`);

    // this._check(obj, relations, map, prefix, cnt, limit, `profile`, this.profile.bind(this));

    return relations;
  }
}
