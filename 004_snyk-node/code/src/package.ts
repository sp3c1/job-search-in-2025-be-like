import { RequestHandler } from 'express';
import got from 'got';
import {
  maxSatisfying,
  valid,
} from 'semver';

import { ValidationError } from './error.handler';
import { NPMPackage } from './types';

type Package = {
  version: string;
  dependencies?: Record<string, Package>;
  circular?: boolean;
};

const memoryStore: Record<string, NPMPackage> = {};

// simulate memory store
async function getFromMemstore(key) {
  try {
    return JSON.parse(JSON.stringify(memoryStore[`${key}`]));
  } catch (err) {
    // console.error(err);
    return null;
  }
}

// simulate memory store
async function setAtMemoryStore(key, value) {
  try {
    memoryStore[`${key}`] = JSON.parse(JSON.stringify(value));
  } catch (err) {
    // console.error(err);
  }
}

/**
 * Attempts to retrieve package data from the npm registry and return it
 */
export const getPackage: RequestHandler = async function (req, res, next) {
  // review: validate name / version
  const { name, version } = req.params;
  // review: type the tree  const dependencyTree: {[key: string]: Package}
  let dependencies: Package;

  try {
    if (`${name}` === '' || `${name}` === 'undefined') {
      throw new ValidationError('Pkg name needs to be provider');
    }

    if (!valid(version)) {
      throw new ValidationError('Pkg needs valid version');
    }

    dependencies = await getDependencies(name, version, 0, {});
    return res
      .status(200)
      .json({ name, version, dependencies: dependencies?.dependencies });
  } catch (error) {
    return next(error);
  }
};

function checkCircleMap(
  name,
  range,
  level,
  circleMap: { [key: string]: { cnt: number; lvl: number } },
) {
  const key = `${name}@${range}`;
  if (!circleMap[key]) {
    circleMap[key] = { cnt: 1, lvl: level };
  } else {
    circleMap[key].cnt += 1;
  }

  return level && level !== circleMap[key].lvl && circleMap[key].cnt > 1;
}

async function getDependencies(
  name: string,
  range: string,
  level: number,
  circleMap: { [key: string]: { cnt: number; lvl: number } },
): Promise<Package> {
  let npmPackage: NPMPackage = await getFromMemstore(`${name}`);

  if (!npmPackage) {
    npmPackage = JSON.parse(
      JSON.stringify(await got(`https://registry.npmjs.org/${name}`).json()),
    );
    await setAtMemoryStore(`${name}`, {
      versions: Object.fromEntries(
        Object.entries(npmPackage.versions).map(([version, obj]) => [
          version,
          { dependencies: obj.dependencies },
        ]),
      ),
    });
  }

  const v =
    level === 0
      ? range
      : maxSatisfying(Object.keys(npmPackage.versions), range);

  const dependencies: Record<string, Package> = {};

  if (checkCircleMap(name, range, level, circleMap)) {
    return { version: range, circular: true };
  }

  if (v) {
    const newDeps = npmPackage.versions[v]?.dependencies;
    const promises: Promise<Package>[] = [];

    const entries = Object.entries(newDeps ?? {});
    for (const [name, range] of entries) {
      promises.push(
        (async () => {
          return getDependencies(name, range, level + 1, circleMap);
        })(),
      );
    }
    const results = await Promise.allSettled(promises);

    for (const resultIndex in results) {
      const [entryName, localRange] = entries[resultIndex];
      const result = results[resultIndex];

      if (result.status === 'fulfilled') {
        dependencies[entryName] = result.value;
      } else {
        dependencies[entryName] = { version: localRange, dependencies: {} };
      }
    }
  }

  return { version: v ?? range, dependencies };
}
