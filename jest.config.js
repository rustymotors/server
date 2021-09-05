module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,js}', '!**/vendor/**'],
  coverageReporters: ['text', 'html', 'lcov'],
  transform: {},
}
