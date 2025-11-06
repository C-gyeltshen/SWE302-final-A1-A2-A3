const { test: base } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

// Extend base test to add coverage collection
const test = base.extend({
  context: async ({ context }, use) => {
    // Collect coverage after each test
    await context.addInitScript(() => {
      // Expose a function to get coverage
      window.__coverage__ = window.__coverage__ || {};
    });

    await use(context);

    // After test, collect coverage
    for (const page of context.pages()) {
      const coverage = await page.evaluate(() => window.__coverage__);
      if (coverage) {
        const coverageDir = path.join(process.cwd(), ".nyc_output");
        if (!fs.existsSync(coverageDir)) {
          fs.mkdirSync(coverageDir, { recursive: true });
        }

        const coverageFile = path.join(
          coverageDir,
          `coverage-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
        );
        fs.writeFileSync(coverageFile, JSON.stringify(coverage));
      }
    }
  },
});

module.exports = { test };
