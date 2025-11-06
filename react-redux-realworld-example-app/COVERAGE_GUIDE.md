# Test Coverage with Istanbul/NYC and Playwright

This document explains how to collect and view test coverage for Playwright tests using Istanbul/NYC.

## Setup Overview

The project is now configured with:

- **NYC (Istanbul)**: Code coverage tool
- **Babel with Istanbul plugin**: For code instrumentation
- **Playwright**: Test runner with coverage collection hooks

## Configuration Files

### 1. `.nycrc` - NYC Configuration

Defines which files to include/exclude and report formats:

- Includes: `src/**/*.js`
- Excludes: test files, index.js, setupTests.js
- Reporters: HTML, text, lcov, JSON

### 2. `babel.config.js` - Babel Configuration

Instruments code when `BABEL_ENV=test`:

```javascript
env: {
  test: {
    plugins: ["istanbul"];
  }
}
```

### 3. `test/fixtures.js` - Coverage Collection

Custom Playwright fixtures that:

- Inject coverage collection into browser context
- Extract `window.__coverage__` after each test
- Save coverage data to `.nyc_output/` directory

## Running Coverage

### Option 1: Using NPM Script (Recommended)

```bash
npm run test:coverage
```

This will:

1. Clean previous coverage data
2. Run all Playwright tests with instrumentation
3. Generate coverage reports in multiple formats

### Option 2: Using the Shell Script

```bash
./run-coverage.sh
```

### Option 3: Step by Step

```bash
# Clean previous coverage
rm -rf .nyc_output coverage

# Run tests with instrumentation
BABEL_ENV=test npx playwright test

# Generate reports
npx nyc report --reporter=html --reporter=text
```

## Viewing Coverage Reports

### HTML Report (Interactive)

```bash
npm run coverage:view
```

Or manually open: `coverage/index.html`

### Terminal Output

The text reporter shows a summary in the terminal after running tests.

### LCOV Report

Located at `coverage/lcov.info` - useful for CI/CD integration and IDE plugins.

## Coverage Reports Location

After running tests with coverage:

```
coverage/
├── index.html          # Main HTML report (open this in browser)
├── lcov-report/        # Detailed HTML reports per file
├── lcov.info          # LCOV format (for CI/CD)
├── coverage-final.json # JSON format
└── clover.xml         # Clover format (for some CI tools)

.nyc_output/           # Raw coverage data (intermediate)
└── coverage-*.json    # Coverage from each test
```

## Understanding Coverage Metrics

NYC reports four types of coverage:

1. **Statements**: % of executable statements executed
2. **Branches**: % of conditional branches (if/else) executed
3. **Functions**: % of functions called
4. **Lines**: % of lines of code executed

## Running Specific Tests with Coverage

### Unit Tests Only

```bash
BABEL_ENV=test npx playwright test test/reducers
npx nyc report --reporter=html --reporter=text
```

### E2E Tests Only

```bash
BABEL_ENV=test npx playwright test test/components
npx nyc report --reporter=html --reporter=text
```

## Troubleshooting

### Coverage showing 0%

- Ensure `BABEL_ENV=test` is set when starting the dev server
- Check that babel.config.js is being loaded
- Verify the app is using the instrumented code

### Coverage not collected

- Make sure the dev server is started with instrumentation: `BABEL_ENV=test npm start`
- Check that `window.__coverage__` is available in browser console
- Ensure `.nyc_output/` directory has coverage JSON files

### Server not starting

- Kill any existing processes on port 4100: `lsof -ti:4100 | xargs kill -9`
- Try running the dev server manually: `BABEL_ENV=test npm start`

## CI/CD Integration

For CI/CD pipelines, you can use the LCOV report:

```yaml
# Example GitHub Actions
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Coverage Thresholds

To enforce minimum coverage, you can add thresholds to `.nycrc`:

```json
{
  "check-coverage": true,
  "lines": 80,
  "statements": 80,
  "functions": 80,
  "branches": 80
}
```

Then run: `npx nyc check-coverage`

## Additional Scripts

All available coverage-related scripts:

```bash
npm run test:coverage          # Run tests and generate coverage
npm run test:coverage:report   # Regenerate reports from existing data
npm run coverage:view          # Open HTML report in browser
```

## Notes

- Coverage data is instrumented at runtime using Babel
- The instrumented code runs in the browser during tests
- Coverage is extracted from `window.__coverage__` global variable
- NYC aggregates coverage from all test runs
- Keep `.nyc_output/` and `coverage/` in your `.gitignore`
