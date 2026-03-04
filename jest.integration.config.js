export default {
  testMatch: ['**/__tests__/integration/**/*.test.js'],
  globalSetup: './__tests__/integration/setup/globalSetup.js',
  globalTeardown: './__tests__/integration/setup/globalTeardown.js',
  setupFilesAfterEnv: ['./__tests__/integration/setup/testSetup.js'],
}
