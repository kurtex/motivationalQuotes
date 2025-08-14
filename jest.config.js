const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/'], // Removed node_modules
  transformIgnorePatterns: [], // Add this to ensure node_modules are transformed
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\.(ts|tsx)$': 'ts-jest', // Use ts-jest for ts/tsx files
  },
};

module.exports = createJestConfig(customJestConfig);