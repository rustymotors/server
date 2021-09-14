module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/*.ts', '!**/node_modules/**'],
  coverageReporters: ['text', 'html', 'lcov'],
  modulePathIgnorePatterns: ['/*.js']
}
