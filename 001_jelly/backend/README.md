# NestJS Monorepo Template

For file upload use header `apollo-require-preflight` with value `true`.

All the endpoints are after Role guard, pleases set `x-api-key` header and matching env in `./apps/api/.env` under `AUTH_API_KEY`

This is my based on my own boiler plate `https://github.com/sp3c1/template-nestjs`.

Main api is name

## Env

Should be set in src on app level, so `./src/apps/*/.env`. If a platform has issue with reading the env, adjust the `./src/apps/*/src/main.ts` (all of 4 services use same env structure and variables). Suggest to use `./src/apps/api/.env.example`.

## Docker Composer

Postgres and redis to work alongside app.

```bash
docker composer up -d
```

## Install and run

```bash
npm install
npm run build:libs:all

#### in 4 differen terminals run
npm run start:apps:api                # main GQL api
npm run start:apps:ingredients-csv    # microservice 
npm run start:apps:insert-ingredients # microservice
npm run start:apps:price-update       # microservice
```

More build/run commands in pkg json.

This repo follow NestJs monorepo pattern.

## Docker

Docker files are on the level of apps. Run from root.

```bash
docker build -f ./apps/api/Dockerfile . -t api
```

## GraphQL for template

Playground available at [http://localhost:3000/graphql](http://localhost:3000/graphql).


## Subscription GQL

Make sure to use `graphql-ws` protocol

## Services

- api: main GQL API
- ingredients-csv: microscervice processing the csv file
- insert-ingredients: microscerviceprocessing inserting ingredties/suppliers and pairs
- price-update: microscervice processing price updates



## Some queries to run

```GQL

query Ingredients($pagination: Pagination!) {
  ingredients(pagination: $pagination) {
    id
    name
    suppliers {
      id
    }
  }
}

query suppliers($pagination: Pagination!) {
  suppliers(pagination: $pagination) {
    id
    name
  }
}

mutation CreateReciepte($name: String!, $ingredients: [IngredientsWithQuantity!]!) {
  createReciepte(name: $name, ingredients: $ingredients) {
    id
    name
  }
}

query Reciepes($pagination: Pagination!) {
  reciepes(pagination: $pagination) {
    id
    name
    reciepeToIngredient {
      id
      ingredientId
      quantity
      reciepeId
      ingredient {
        latestIngredientPrice {
          id
          changedAt
          price
        }
      }
    }
  }
}
```