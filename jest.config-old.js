module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: ["packages/**/*.ts"],
  coverageReporters: ["text", "html", "lcov"],
  modulePathIgnorePatterns: ["/*.js"]
}
