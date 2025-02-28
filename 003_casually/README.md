# Run instructions

Assuming ES is running. Required Node ^20.16.0 (please reffer to `package.json`). Structure is based on the NestJS monorepo pattern, and my own [templating](https://github.com/sp3c1/template-nestjs/). Shared code is in `./libs`, cli and api is `./apps`.

```sh
npm install
npm run build:libs:all

npm run test

cp .env.test .env # top level env is for CLI's
cp ./apps/api/.env.example ./apps/api/.env # api level .env

# CLI
npm run build:apps:import-articles # build the CLI
node ./dist/apps/import-articles/main.js -f mock-data.ndjson -i articles # run the import

# API
npm run start:apps:api
```

----


## Task 2 Query

```elastic search
POST /articles/_search
{
  "query": {
    "function_score": {
      "query": {
        "nested": {
          "path": "relationships",
          "query": {
            "term": {
              "relationships.cause_concept_name": {
                "value": "coffee"
              }
            }
          }
        }
      },
      "functions": [
        {
          "filter": {
            "match": {
              "title": "coffee"
            }
          },
          "weight": 1
        },
        {
          "filter": {
            "match": {
              "tags": "coffee"
            }
          },
          "weight": 0.51
        },
        {
          "filter": {
            "match": {
              "abstract": "coffee"
            }
          },
          "weight": 0.1
        }
      ],
      "score_mode": "sum",
      "boost_mode": "replace"
    }
  },
  "sort": [
    { "_score": "desc" }
  ]
}
```

## GraphQL for api

Playground available at [http://localhost:3000/graphql](http://localhost:3000/graphql).

## OpenAPI api

Docs available at [http://localhost:3000/doc](http://localhost:3000/doc)

<br><br><br><br><br><br><br><br>

# Causaly back-end dev assignment

> _"Help me, Obi-Wan Kenobi. You're my only hope."_<br /> \- Princess Leia Organa

Consider the following ElasticSearch schema representing an article index:

```json
{
  "mappings": {
    "properties": {
      "uuid": {
        "type": "keyword",
        "ignore_above": 256,
        "normalizer": "to_lowercase"
      },
      "title": {
        "type": "text",
        "analyzer": "standard"
      },
      "abstract": {
        "type": "text",
        "analyzer": "standard"
      },
      "tags": {
        "type": "text",
        "fields": {
          "keyword": {
            "type": "keyword",
            "ignore_above": 256,
            "normalizer": "to_lowercase"
          }
        },
        "analyzer": "standard"
      },
      "relationships": {
        "type": "nested",
        "properties": {
          "cause_concept_name": {
            "type": "keyword",
            "ignore_above": 256,
            "normalizer": "to_lowercase"
          },
          "effect_concept_name": {
            "type": "keyword",
            "ignore_above": 256,
            "normalizer": "to_lowercase"
          }
        }
      }
    }
  },
  "settings": {
    "index": {
      "analysis": {
        "normalizer": {
          "to_lowercase": {
            "filter": ["lowercase"],
            "type": "custom"
          }
        }
      }
    }
  }
}
```

Each article has 5 attributes:

- `uuid` - article unique ID, e.g. "PMID15389210_20200420_0.4"
- `title` - article title
- `abstract` - article abstract (short description of what the article is about)
- `tags` - article tags
- `relationships` - causality data extracted from Causaly’s ML algorithm, representing relationships between medical concepts detected in the article

## Task 1: CLI

Write a Command Line Interface (CLI) using Node.js that will (a) create an index in ElasticSearch and (b) populate that index with the supplied [mock data](./mock-data.ndjson).

### Requirements

1. The index name must be passed as an argument to the CLI;
2. The CLI must ensure that the index does NOT already exist before creating it;
3. The index must use the aforementioned ElasticSearch schema;
4. To avoid stressing the ElasticSearch cluster, the code must ensure that there are no more than three (3) in-flight upload requests in parallel;
5. The solution must be written in JavaScript or TypeScript;
6. You are allowed to use any CLI helpers of your choice, e.g. `commander`, `meow`, etc;
7. Please provide simple instructions on how to use the CLI.

### Notes

- Mock data are provided in new-line delimited JSON format - they can be found at [./mock-data.ndjson](./mock-data.ndjson);
- To complete this task you will need to connect to an ElasticSearch server. The `docker-compose.yml` file can help you quickly setup a local dev environment with ElasticSearch and Kibana.

  For the setup you will need [Docker](https://www.docker.com/products/docker-desktop) installed on your device. After you have it installed, you can run `docker-compose up`. Docker will download the official docker containers and start ElasticSearch and Kibana.

  After `docker-compose` finishes, verify that ElasticSearch is running at: `http://localhost:9200`.

  You can also access Kibana at: `http://localhost:5601/app/dev_tools#/console`.

## Task 2: ElasticSearch Query

Write an ElasticSearch query that searches for articles containing _effects of coffee_ in the previously created index.

Important! By _effects of coffee_ we mean articles that have "coffee" as `cause_concept_name` in **at least one (1)** of their relationships.

Boost the score of articles that contain the word "coffee" in their title, abstract or tags as follows:

| Field Name | Boost Factor |
| ---------- | ------------ |
| title      | 1            |
| tags       | 0.51         |
| abstract   | 0.1          |

Sum all scores together to calculate the article’s final score and **sort in DESC order**.

### Notes

- It does not matter how many times you find the word "coffee" in the title, abstract or tags attributes.

  For example, the article title `"Is coffee healthy? A study on coffee."` should yield a score of 1 instead of 2.

  Same for abstract and tags.

## Task 3: API server

Create an API server using Node.js to expose the articles returned by ElasticSearch using the query developed in the previous task.

Important! Pass _concept name_ as an argument.

##### Example

```
GET /effects?concept=coffee

{
  "articles": [
    {
      "uuid": "article UUID",
      "title": "article title",
      "abstract": "article abstract",
      "score": 2.1
    }
  ]
}
```

### Requirements

1. Implement your solution using JavaScript (or TypeScript);
2. You may use any web frameworks or utility libraries of your choice, e.g. `express`, `koa`, `fastify`, etc;
3. Feel free to design your own API or follow the example above;
4. The API endpoint should accept _concept name_ as input;
5. Provide simple instructions on how to run the server.

## Deliverable

Please submit your solution by [opening a PR](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request) in your cloned git repository, but do not merge it.

### Time requirement

1-3 hours

### Skills assessment

- Familiarity with Node.js and JavaScript/TypeScript;
- Familiarity with ElasticSearch;
- Logic and code structure;
- Attention to detail.
