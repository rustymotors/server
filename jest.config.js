export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['packages/**/*.js', '!packages/**/*.test.js'],
  coverageReporters: ['text', 'html', 'lcov'],
  transform: {},
}
