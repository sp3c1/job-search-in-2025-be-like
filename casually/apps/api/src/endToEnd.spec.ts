import axios from 'axios';
import { Server } from 'http';

import { setupApp } from './bootstrap';

describe('Tests end to end', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    require('dotenv').config({ path: './.env.test' });

    const app = await setupApp(true);
    server = await app.listen(0);

    const addr = server.address();
    if (addr && typeof addr === 'object') {
      port = addr.port;
    } else {
      throw new Error('Failed to get address for server');
    }
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    // teardown if applicable
  });

  describe('REST', () => {
    it('should get all articles', async () => {
      const res = await axios.get(`http://localhost:${port}/api/articles`);
      expect(res.data).toMatchSnapshot();
    });

    it('should get all articles', async () => {
      const res = await axios.get(`http://localhost:${port}/api/articles/coffee`);
      expect(res.data).toMatchSnapshot();
    });
  });

  describe('GQL', () => {
    it('should get all articles', async () => {
      const res = await axios.post(`http://localhost:${port}/graphql`, {
        query: `query Articles($keyword: String) {
            articles {
              relationships {
                cause_concept_name
                effect_concept_name
              }
              score
              tags
              title
              uuid
            }
          }`,
        variables: null,
        operationName: 'Articles',
      });
      expect(res.data).toMatchSnapshot();
    });

    it('should get all articles for coffee', async () => {
      const res = await axios.post(`http://localhost:${port}/graphql`, {
        query: `query Articles($keyword: String) {
            articles(keyword: $keyword) {
              relationships {
                cause_concept_name
                effect_concept_name
              }
              score
              tags
              title
              uuid
            }
          }`,
        variables: { keyword: 'coffee' },
        operationName: 'Articles',
      });
      expect(res.data).toMatchSnapshot();
    });
  });
});
