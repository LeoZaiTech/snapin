module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  setupFiles: ['dotenv/config'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '\.integration\.test\.ts$'
  ],
};
