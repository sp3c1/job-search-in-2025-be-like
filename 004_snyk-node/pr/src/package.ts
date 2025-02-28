// review: sort imports
import { RequestHandler } from 'express';
import got from 'got';
import { maxSatisfying } from 'semver';

import { NPMPackage } from './types';

type Package = { version: string; dependencies: Record<string, Package> };

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  // review: name and version not validated (test version with semver)
  // idea: throw custom application error for validation
  const { name, version } = req.params;
  // review: describe dependecy tree with type, for example {[key:string]: Package}
  const dependencyTree = {};
  try {
    // review: section could be all merged into getDependencies
    const npmPackage: NPMPackage = await got(
      `https://registry.npmjs.org/${name}`,
    ).json();

    // review: do not trust payload to be ok, use ? operator to fetch nest deps
    const dependencies: Record<string, string> =
      npmPackage.versions[version].dependencies ?? {};
    for (const [name, range] of Object.entries(dependencies)) {
      const subDep = await getDependencies(name, range);
      dependencyTree[name] = subDep;
    }
    // review: section could be all merged into getDependencies

    return res
      .status(200)
      .json({ name, version, dependencies: dependencyTree });
  } catch (error) {
    // review: add error middlware to handle erros
    return next(error);
  }
};

// review / idea: add circleMap to track if the circular deps
// idea: use functional pattern and provide structure to fill instead of reccurent return
async function getDependencies(name: string, range: string): Promise<Package> {
  // review / idea: first check mem store
  // idea: abstract the call
  const npmPackage: NPMPackage = await got(
    `https://registry.npmjs.org/${name}`,
  ).json();

  // idea: save into mem store: opt save only the relevant data
  // idea: adjust CircleMap

  const v = maxSatisfying(Object.keys(npmPackage.versions), range);
  const dependencies: Record<string, Package> = {};

  if (v) {
    const newDeps = npmPackage.versions[v].dependencies;
    // review: this needs to be parallelised, best with Promise.allSettled
    // to handle the errors
    for (const [name, range] of Object.entries(newDeps ?? {})) {
      dependencies[name] = await getDependencies(name, range);
    }
  }

  return { version: v ?? range, dependencies };
}
