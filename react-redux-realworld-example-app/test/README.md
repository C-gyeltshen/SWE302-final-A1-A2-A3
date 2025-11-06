# Test Directory

This folder contains all Playwright tests for the react-redux-realworld-example-app.

## Directory Structure

```
test/
├── components/          # E2E component tests (require app running)
│   ├── ArticleList.spec.js
│   ├── ArticlePreview.spec.js
│   ├── ListErrors.spec.js
│   └── ListPagination.spec.js
└── reducers/           # Unit tests for Redux reducers
    ├── article.spec.js
    ├── articleList.spec.js
    ├── auth.spec.js
    ├── common.spec.js
    ├── editor.spec.js
    ├── home.spec.js
    ├── profile.spec.js
    └── settings.spec.js
```

## Running Tests

### Run All Tests

```bash
npm run test:playwright
```

### Run Only Unit Tests (Reducers)

```bash
npm run test:playwright:unit
```

This runs all reducer tests - they don't require the app to be running.

### Run Only E2E Tests (Components)

```bash
npm run test:playwright:e2e
```

⚠️ **Note**: Component tests require the app to be running on http://localhost:4100

To run component tests:

1. Start the app: `npm start`
2. In another terminal: `npm run test:playwright:e2e`

### Run Tests in UI Mode (Interactive)

```bash
npm run test:playwright:ui
```

### Run Tests with Visible Browser

```bash
npm run test:playwright:headed
```

### Debug Tests

```bash
npm run test:playwright:debug
```

### View Test Report

```bash
npm run test:playwright:report
```

## Test Types

### Unit Tests (test/reducers/)

- Test Redux reducer functions
- Pure function testing
- No browser required
- Fast execution (~3-4 seconds)
- **142 tests total**

### E2E Tests (test/components/)

- Test actual UI components in a browser
- Require the application to be running
- Test user interactions and visual behavior
- **42 tests total**

## Test Statistics

- **Total Tests**: 184
- **Unit Tests**: 142 (reducers)
- **E2E Tests**: 42 (components)

## Quick Commands

```bash
# Run only reducer tests (fast, no server needed)
npx playwright test test/reducers

# Run only component tests (needs server running)
npx playwright test test/components

# Run specific test file
npx playwright test test/reducers/article.spec.js

# Run tests matching a pattern
npx playwright test --grep "should add comment"
```

## Configuration

Tests are configured in `playwright.config.js` at the project root.

Key settings:

- Test directory: `./test`
- Base URL: `http://localhost:4100`
- Auto-start web server for E2E tests
- Parallel execution enabled
