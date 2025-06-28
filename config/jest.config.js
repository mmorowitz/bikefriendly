export default {
  rootDir: '..',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
    '\\.(astro)$': '<rootDir>/tests/__mocks__/astroMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.js',
    'src/**/*.astro',
    '!src/pages/**',
    '!src/env.d.ts'
  ],
  transform: {
    '^.+\\.astro$': '<rootDir>/tests/transform/astro.js',
    '^.+\\.js$': 'babel-jest'
  }
};