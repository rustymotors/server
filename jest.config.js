module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts', '!**/vendor/**'],
  coverageReporters: ['text', 'html', 'lcov'],
  modulePathIgnorePatterns: ['/*.js'],
}
