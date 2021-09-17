export const preset = 'ts-jest';
export const testEnvironment = 'node';
export const collectCoverage = true;
export const collectCoverageFrom = ['packages/**/*.ts'];
export const coverageReporters = ['text', 'html', 'lcov'];
export const modulePathIgnorePatterns = ['/*.js'];
