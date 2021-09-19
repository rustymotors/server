module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['./test/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: ["./src/**/*.ts"],
  coverageReporters: ["text", "html", "lcov"],
};