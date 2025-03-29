const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Путь к вашему Next.js приложению
  dir: './',
})

// Добавляем любые дополнительные конфигурации Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

// createJestConfig экспортируется таким образом, чтобы next/jest мог загрузить конфигурацию Next.js
module.exports = createJestConfig(customJestConfig) 