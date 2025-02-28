import got from 'got';
import { Server } from 'http';

import { createApp } from '../src/app';

const pkgs: { [key: string]: { name: string; version: string } } = {
  trucolor: {
    name: 'trucolor',
    version: '4.0.4',
  },
  '@snyk/snyk-cocoapods-plugin': {
    name: '@snyk/snyk-cocoapods-plugin',
    version: '2.6.0',
  },
  react: {
    name: 'react',
    version: '16.13.0',
  },
  express: {
    name: 'express',
    version: '4.21.2',
  },
  npm: {
    name: 'npm',
    version: '11.0.0',
  },
};

describe('/package/:name/:version endpoint', () => {
  let server: Server;
  let port: number;

  beforeAll(async () => {
    server = await new Promise((resolve, reject) => {
      const server = createApp().listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          port = addr.port;
          resolve(server);
        } else {
          reject(new Error('Unexpected address ${addr} for server'));
        }
      });
    });

    // hotload;
    for (const key in pkgs) {
      await got(
        `http://localhost:${port}/package/${encodeURIComponent(
          pkgs[key].name,
        )}/${pkgs[key].version}`,
      );
    }
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('should return pkg`s dependiences', () => {
    it('truecolor/4.0.4', async () => {
      const packageName = 'trucolor';
      const packageVersion = '4.0.4';

      const res = await got(
        `http://localhost:${port}/package/${packageName}/${packageVersion}`,
      );
      const json = JSON.parse(res.body);
      expect(json).toMatchSnapshot('truecolor');
    });

    it('@snyk/snyk-cocoapods-plugin/260', async () => {
      const packageName = '@snyk/snyk-cocoapods-plugin';
      const packageVersion = '2.6.0';

      const res = await got(
        `http://localhost:${port}/package/${encodeURIComponent(
          packageName,
        )}/${packageVersion}`,
      );
      const json = JSON.parse(res.body);
      expect(json).toMatchSnapshot('@snyk/snyk-cocoapods-plugin');
    });

    it('react/16.13.0', async () => {
      const packageName = 'react';
      const packageVersion = '16.13.0';

      const res = await got(
        `http://localhost:${port}/package/${packageName}/${packageVersion}`,
      );
      const json = JSON.parse(res.body);
      expect(json).toMatchSnapshot('react');
    });

    it('express/4.21.2', async () => {
      const packageName = 'express';
      const packageVersion = '4.21.2';

      const res = await got(
        `http://localhost:${port}/package/${packageName}/${packageVersion}`,
      );
      const json = JSON.parse(res.body);
      expect(json).toMatchSnapshot('express');
    });

    it('npm/11.0.0', async () => {
      const packageName = 'npm';
      const packageVersion = '11.0.0';

      const res = await got(
        `http://localhost:${port}/package/${packageName}/${packageVersion}`,
      );
      const json = JSON.parse(res.body);
      expect(json).toMatchSnapshot('npm');
    });
  });

  // xit('responds', async () => {
  //   const packageName = 'react';
  //   const packageVersion = '16.13.0';

  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const res: any = await got(
  //     `http://localhost:${port}/package/${packageName}/${packageVersion}`,
  //   );
  //   const json = JSON.parse(res.body);

  //   expect(res.statusCode).toEqual(200);
  //   expect(json.name).toEqual(packageName);
  //   expect(json.version).toEqual(packageVersion);
  //   expect(json.dependencies).toEqual({
  //     'loose-envify': {
  //       version: '1.4.0',
  //       dependencies: {
  //         'js-tokens': {
  //           version: '4.0.0',
  //           dependencies: {},
  //         },
  //       },
  //     },
  //     'object-assign': {
  //       version: '4.1.1',
  //       dependencies: {},
  //     },
  //     'prop-types': {
  //       // review: updated the version
  //       version: '15.8.1',
  //       dependencies: {
  //         'object-assign': {
  //           version: '4.1.1',
  //           dependencies: {},
  //         },
  //         'loose-envify': {
  //           version: '1.4.0',
  //           dependencies: {
  //             'js-tokens': {
  //               version: '4.0.0',
  //               dependencies: {},
  //             },
  //           },
  //         },
  //         'react-is': {
  //           version: '16.13.1',
  //           dependencies: {},
  //         },
  //       },
  //     },
  //   });
  // });
});
