/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  // El primer render de cada suite de pantallas puede pasar los 5 s por
  // defecto cuando todas las suites corren en paralelo (sobre todo en OneDrive).
  testTimeout: 15000,
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};
