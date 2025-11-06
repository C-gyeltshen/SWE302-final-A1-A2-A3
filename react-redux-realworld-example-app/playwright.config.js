const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.js",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    trace: "on-first-retry",
    baseURL: "http://localhost:4100",
    // Collect coverage data
    coverageOptions: {
      enabled: true,
    },
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "BABEL_ENV=test npm start",
    url: "http://localhost:4100",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
