const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './'
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^lucide-react$': '<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js'
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '!**/__tests__/e2e/**/*.[jt]s?(x)',
    '!**/__tests__/mocks/**/*.[jt]s?(x)',
    '!**/__tests__/test-utils.[jt]s?(x)',
    '!**/__tests__/setupTests.[jt]s?(x)',
    '!**/__tests__/jest.setup.[jt]s?(x)',
    '!**/__tests__/jest.globals.[jt]s?(x)',
    '!**/.babelrc.test.js'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react).+\\.js$'
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx'
      }
    }
  },
  testTimeout: 20000,
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  testEnvironmentOptions: {
    customExportConditions: [''],
    url: 'http://localhost:3000'
  },
  verbose: true,
  collectCoverage: false
}

module.exports = createJestConfig(customJestConfig) 