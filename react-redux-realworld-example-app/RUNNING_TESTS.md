# Running Unit Tests

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage --watchAll=false

# Run specific test file
npm test -- auth.test.js

# Run only reducer tests
npm test -- --testPathPattern=reducers
```

## Test Results

### Reducer Tests (✅ All Passing)

```bash
npm test -- --testPathPattern=reducers --coverage --watchAll=false
```

**Expected Output**:

- ✅ 8 test suites passed
- ✅ 142 tests passed
- ✅ 100% coverage for all reducers
- ⏱️ ~1.2s execution time

### Current Coverage

| Category   | Coverage                 |
| ---------- | ------------------------ |
| Reducers   | 100%                     |
| Components | Written (see note below) |

## Test Files

### Reducer Tests (✅ Working)

- `src/reducers/article.test.js` - Article page reducer
- `src/reducers/articleList.test.js` - Article list reducer
- `src/reducers/auth.test.js` - Authentication reducer
- `src/reducers/common.test.js` - Common/app reducer
- `src/reducers/editor.test.js` - Editor reducer
- `src/reducers/home.test.js` - Home page reducer
- `src/reducers/profile.test.js` - Profile reducer
- `src/reducers/settings.test.js` - Settings reducer

### Component Tests (📝 Written)

- `src/components/ListErrors.test.js`
- `src/components/ListPagination.test.js`
- `src/components/ArticleList.test.js`
- `src/components/ArticlePreview.test.js`

**Note**: Component tests require compatible testing library configuration due to older react-scripts version (v1.1.1).

## Viewing Coverage Reports

After running tests with coverage:

```bash
# Generate HTML coverage report
npm test -- --coverage --watchAll=false

# Coverage files will be in: coverage/
```

The coverage report shows:

- **Statements**: % of code statements executed
- **Branches**: % of conditional branches tested
- **Functions**: % of functions called
- **Lines**: % of code lines executed

## Troubleshooting

### Tests not running?

Ensure all dependencies are installed:

```bash
rm -rf node_modules
npm install
```

### Want to run in watch mode?

```bash
npm test
# Press 'a' to run all tests
# Press 'p' to filter by filename
# Press 'q' to quit
```

## Test Structure

Each test file follows this pattern:

```javascript
describe('Component/Reducer Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = {...};

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

## Dependencies

Testing dependencies installed:

- `@testing-library/react` v11.2.7
- `@testing-library/jest-dom` v5.16.1
- `@testing-library/user-event` v13.5.0
- `redux-mock-store` v1.5.4

## More Information

See `TEST_IMPLEMENTATION_SUMMARY.md` for:

- Detailed test coverage breakdown
- Test patterns and examples
- Complete list of test cases
- Known issues and resolutions
