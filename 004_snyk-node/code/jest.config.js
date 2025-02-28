module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/test/tsconfig.json',
    },
  },
  testTimeout: 40000,
};
