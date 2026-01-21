export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'backend/services/**/*.js',
    'backend/middleware/**/*.js',
    '!backend/**/*.test.js'
  ],
  testMatch: [
    '**/backend/tests/**/*.test.js',
    '**/backend/**/*.test.js'
  ],
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  setupFilesAfterEnv: ['<rootDir>/backend/tests/setup.js'],
  testTimeout: 10000,
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
