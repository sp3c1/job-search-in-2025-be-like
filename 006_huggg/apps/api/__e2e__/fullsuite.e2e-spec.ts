import * as request from 'supertest';

import { Logger } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';

import { createApp } from '../src/bootstrap';

require('dotenv').config({ path: '.env.test' });

export let app;

export async function createTestApp() {

    const localApp = await createApp();
    localApp.enableShutdownHooks();
    await localApp.listen(0);
    return localApp;
}

beforeAll(async () => {
    if (!app) {
        Logger.overrideLogger(false);
        app = await createTestApp();
    }
});

afterAll(async () => {
    if (app) {
        await app.close();

        const dataSource = app.get(getDataSourceToken());
        if (dataSource && dataSource.isInitialized) {
            // Destroy the DataSource to close all connections.
            await dataSource.destroy();
        }

        // If caching is enabled, the Redis client may still be active.
        // Depending on the cache implementation, it might be stored as 'client' on the queryResultCache.
        const cache = dataSource.queryResultCache;
        if (cache && cache.client && typeof cache.client.quit === 'function') {
            await cache.client.quit();
        }

    }
});


describe('End to end test', () => {
    let fastifyInstance;
    let nodeServer;

    beforeAll(() => {
        fastifyInstance = app.getHttpAdapter().getInstance();
        nodeServer = fastifyInstance.server;
    })

    describe(`Product`, () => {
        describe(`Stores for product /v1/product/{productId}/store`, () => {
            let url = `/v1/product/9358edae-2f40-4b5f-b5b1-588f96341d4b/store`;

            it('OK ', async () => {
                const response = await request(nodeServer).get(url);
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK cached', async () => {
                const response = await request(nodeServer).get(url);
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK size 20 page 1', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=1');
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK size 20 page 2', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=2');
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK size 2 page 2', async () => {
                const response = await request(nodeServer).get(url + '?size=2&page=2');
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK size 20 page 6 (not full results)', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=6');
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK size 20 page 7 (no results)', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=7');
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('Fail siez 20 page -1', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=-1');
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Fail size 0 page 1', async () => {
                const response = await request(nodeServer).get(url + '?size=0&page=1');
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Fail size 100 page 1', async () => {
                const response = await request(nodeServer).get(url + '?size=100&page=1');
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Failed GUUID validateion', async () => {
                const response = await request(nodeServer).get(`/v1/product/9358edae-2f40-4b5f-b5b1-588f96341d4bxxxxxxx/store?size=20&page=1`);
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Failed 404', async () => {
                const response = await request(nodeServer).get(`/v1/product/1258edae-2f40-4b5f-b5b1-588f96341d4b/store?size=20&page=1`);
                expect(response.status).toEqual(404);
                expect(response.body).toMatchSnapshot();
            });
        });
    });


    describe(`Brand`, () => {
        describe(`Products for brand /v1/brad/{brandId}/product`, () => {
            let url = `/v1/brand/a715b837-f4fc-48ba-ba0a-7f53b6dc59c5/product`;

            it('OK ', async () => {
                const response = await request(nodeServer).get(url);
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK cached', async () => {
                const response = await request(nodeServer).get(url);
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK size 20 page 1', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=1');
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('OK size 20 page 2 (no results)', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=2');
                expect(response.status).toEqual(200);
                expect(response.body).toMatchSnapshot();
            });

            it('Fail siez 20 page -1', async () => {
                const response = await request(nodeServer).get(url + '?size=20&page=-1');
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Fail size 0 page 1', async () => {
                const response = await request(nodeServer).get(url + '?size=0&page=1');
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Fail size 100 page 1', async () => {
                const response = await request(nodeServer).get(url + '?size=100&page=1');
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Failed GUUID validateion', async () => {
                const response = await request(nodeServer).get(`/v1/brand/9358edae-2f40-4b5f-b5b1-588f96341d4bxxxxxxx/product?size=20&page=1`);
                expect(response.status).toEqual(400);
                expect(response.body).toMatchSnapshot();
            });

            it('Failed 404', async () => {
                const response = await request(nodeServer).get(`/v1/brand/1258edae-2f40-4b5f-b5b1-588f96341d4b/product?size=20&page=1`);
                expect(response.status).toEqual(404);
                expect(response.body).toMatchSnapshot();
            });
        })
    })
});

