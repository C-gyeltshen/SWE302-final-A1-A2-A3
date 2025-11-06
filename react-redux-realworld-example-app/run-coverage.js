#!/usr/bin/env node

/**
 * Coverage collection script for Playwright tests
 * This script runs Playwright tests and collects coverage using NYC
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const coverageDir = path.join(__dirname, ".nyc_output");
const reportDir = path.join(__dirname, "coverage");

// Ensure directories exist
if (!fs.existsSync(coverageDir)) {
  fs.mkdirSync(coverageDir, { recursive: true });
}

console.log("🧹 Cleaning previous coverage data...");
if (fs.existsSync(coverageDir)) {
  fs.rmSync(coverageDir, { recursive: true, force: true });
}
if (fs.existsSync(reportDir)) {
  fs.rmSync(reportDir, { recursive: true, force: true });
}

fs.mkdirSync(coverageDir, { recursive: true });

console.log("🧪 Running Playwright tests with coverage...\n");

// Run Playwright with environment variable for babel
const playwright = spawn("npx", ["playwright", "test"], {
  env: { ...process.env, BABEL_ENV: "test" },
  stdio: "inherit",
  shell: true,
});

playwright.on("close", (code) => {
  console.log(`\n✅ Tests completed with code ${code}`);

  // Generate coverage reports
  console.log("\n📊 Generating coverage reports...");

  const nyc = spawn(
    "npx",
    [
      "nyc",
      "report",
      "--reporter=html",
      "--reporter=text",
      "--reporter=lcov",
      "--reporter=json",
    ],
    {
      stdio: "inherit",
      shell: true,
    }
  );

  nyc.on("close", (reportCode) => {
    if (reportCode === 0) {
      console.log("\n✅ Coverage reports generated successfully!");
      console.log("📁 HTML Report: coverage/index.html");
      console.log("📄 LCOV Report: coverage/lcov.info");
      console.log("\n💡 To view the HTML report, run: npm run coverage:view");
    } else {
      console.error("\n❌ Failed to generate coverage reports");
      process.exit(reportCode);
    }
  });
});

playwright.on("error", (err) => {
  console.error("❌ Failed to start Playwright:", err);
  process.exit(1);
});
