import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline/promises';

import { Article } from '@app/causaly';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';

import { ImportIndexService } from './import-index.service';

jest.mock('@nestjs/elasticsearch');
jest.mock('node:fs');
jest.mock('node:readline/promises');

describe('ImportArticlesService', () => {
  let service: ImportIndexService;
  let elasticsearchService;
  let index = 'articles'

  beforeEach(async () => {
    elasticsearchService = <any>{
      indices: {
        delete: jest.fn(),
        exists: jest.fn(),
        create: jest.fn(),
      },
      index: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportIndexService,
        { provide: ElasticsearchService, useValue: elasticsearchService },
      ],
    }).compile();

    service = module.get<ImportIndexService>(ImportIndexService);
    (<any>service).logger = {
      log: jest.fn(),
      error: jest.fn(),
    };

    service.fatal = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteIndex', () => {
    it('should call elasticsearchService.indices.delete', async () => {
      elasticsearchService.indices.delete.mockResolvedValue({});

      await service.deleteIndex(index);

      expect(elasticsearchService.indices.delete).toHaveBeenCalledWith({
        index: 'articles',
      });
    });
  });

  describe('indexExists', () => {
    it('should return true if the index exists', async () => {
      elasticsearchService.indices.exists.mockResolvedValue({ statusCode: 200 });

      const result = await service.indexExists(index);

      expect(result).toEqual({ statusCode: 200 });
      expect(elasticsearchService.indices.exists).toHaveBeenCalledWith({
        index: 'articles',
      });
    });

    it('should return false if the index does not exist', async () => {
      elasticsearchService.indices.exists.mockResolvedValue({ statusCode: 404 });

      const result = await service.indexExists(index);

      expect(result).toEqual({ statusCode: 404 });
    });
  });

  describe('ensureIndex', () => {
    it('should not create index if it already exists', async () => {
      elasticsearchService.indices.exists.mockResolvedValue({ statusCode: 200 });

      await service.ensureIndex(index);
      expect(service.fatal).toHaveBeenCalled();
    });

    it('should create the index if it does not exist', async () => {
      elasticsearchService.indices.exists.mockResolvedValue({ statusCode: 404 });
      elasticsearchService.indices.create.mockResolvedValue({});

      await service.ensureIndex(index);

      expect(elasticsearchService.indices.create).toHaveBeenCalled();
      expect(elasticsearchService.indices.create).toHaveBeenCalledWith({
        index: 'articles',
        body: expect.any(Object),
      });
    });
  });

  describe('loadInFile', () => {
    it('should load data from the file and insert it into Elasticsearch', async () => {
      const fakeArticles: string[] = [
        JSON.stringify({
          uuid: '1',
          title: 'Test Article 1',
          abstract: 'Abstract 1',
          tags: [],
          relationships: [],
        }),
        JSON.stringify({
          uuid: '2',
          title: 'Test Article 2',
          abstract: 'Abstract 2',
          tags: [],
          relationships: [],
        }),
      ];

      (<any>createReadStream).mockReturnValueOnce({
        pipe: jest.fn(),
      });

      const rl = {
        [Symbol.asyncIterator]: jest.fn().mockReturnValueOnce(fakeArticles.values()),
      };
      (<any>createInterface).mockReturnValueOnce(rl);

      const chunkedInsertDataMock = jest.spyOn(service, 'chunkedInsertData').mockResolvedValue();

      await service.loadInFile(index, 'path/to/file');

      expect(chunkedInsertDataMock).toHaveBeenCalledWith(
        index,
        fakeArticles.map((entry) => JSON.parse(entry)),
        3
      );
    });
  });

  it('should throw an error if chunks <= 0', async () => {
    const articles: Article[] = [
      {
        uuid: '1',
        title: 'Test Article 1',
        abstract: 'Abstract 1',
        tags: [],
        relationships: [],
      },
    ];

    await expect(service.chunkedInsertData(index, articles, 0)).rejects.toThrow(
      'The number of chunks must be greater than 0.'
    );
  });

  it('should throw an error if no data is provided', async () => {
    await expect(service.chunkedInsertData(index, [], 3)).rejects.toThrow('Nothing to import');
  });

  it('should process all data concurrently using insertDataWhile', async () => {
    const fakeArticles: Article[] = Array.from({ length: 5 }, (_, i) => ({
      uuid: `${i + 1}`,
      title: `Test Article ${i + 1}`,
      abstract: `Abstract ${i + 1}`,
      tags: [],
      relationships: [],
    }));

    const articlesCopy = [...fakeArticles];

    const insertDataWhileSpy = jest.spyOn(service, 'insertDataWhile');
    const insertEntrySpy = jest.spyOn(service, 'insertEntry');

    await service.chunkedInsertData(index, articlesCopy, 3);

    expect(insertDataWhileSpy).toHaveBeenCalledTimes(3);

    expect(insertEntrySpy).toHaveBeenCalledTimes(5);
  });

  it('should handle data with 1 element by chunk of 3', async () => {
    const fakeArticles: Article[] = Array.from({ length: 1 }, (_, i) => ({
      uuid: `${i + 1}`,
      title: `Test Article ${i + 1}`,
      abstract: `Abstract ${i + 1}`,
      tags: [],
      relationships: [],
    }));

    const articlesCopy = [...fakeArticles];

    const insertDataWhileSpy = jest.spyOn(service, 'insertDataWhile');
    const insertEntrySpy = jest.spyOn(service, 'insertEntry');

    await service.chunkedInsertData(index, articlesCopy, 3);

    expect(insertDataWhileSpy).toHaveBeenCalledTimes(3);

    expect(insertEntrySpy).toHaveBeenCalledTimes(1);
  });

  describe('insertData', () => {
    it('should insert data into Elasticsearch', async () => {
      const fakeArticle: Article = {
        uuid: '1',
        title: 'Test Article',
        abstract: 'Test Abstract',
        tags: [],
        relationships: [],
      };

      const insertEntryMock = jest.spyOn(service, 'insertEntry').mockResolvedValue(undefined);

      await service.insertDataWhile(index, [fakeArticle]);

      expect(insertEntryMock).toHaveBeenCalledWith(index, fakeArticle);
    });
  });
});
