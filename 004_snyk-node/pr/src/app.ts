import * as express from 'express';

import { getPackage } from './package';

// review general notes: old node that is out of support
// start command in package.json does not work for windows machines
// nodemon in given version does not work on new windows machines
// ts target needs to be adjusted for features like Promise.allSettled

/**
 * Bootstrap the application framework
 */
export function createApp(): express.Express {
  const app = express();

  app.use(express.json());

  app.get('/package/:name/:version', getPackage);

  // review: add error handler

  return app;
}
