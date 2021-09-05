export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'services/**/*.js',
    '!**/vendor/**',
    '!services/**/*.test.js',
  ],
  coverageReporters: ['text', 'html', 'lcov'],
  transform: {},
}
