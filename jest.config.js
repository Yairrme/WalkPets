// Las pruebas usan el modo en memoria. Se fija acá (antes de transformar los
// módulos) porque Expo puede incrustar las variables EXPO_PUBLIC_ al compilar.
process.env.EXPO_PUBLIC_DATA_SOURCE = 'mock';

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.test.ts?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/', '/dist/'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'src/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};
