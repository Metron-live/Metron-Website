const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  fullyParallel: false,
  workers: 1,
  use: { browserName: 'chromium' }
});
