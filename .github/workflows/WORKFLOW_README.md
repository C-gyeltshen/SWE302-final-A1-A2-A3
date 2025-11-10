# GitHub Workflow - Snyk Security & Testing Pipeline

## Overview

This workflow provides comprehensive security scanning and testing for both the Go backend and React frontend applications in this repository.

## Workflow Jobs

### 🔵 Backend (Go) Jobs

#### 1. **go-unit-tests**

- Runs all unit tests for the Go backend
- Tests modules: `users`, `articles`, `common`
- Generates coverage reports for each module
- Uploads coverage artifacts

#### 2. **go-integration-tests**

- Executes the complete integration test suite
- Uses `run_integration_tests.sh` script
- Generates combined coverage report with HTML output
- Uploads coverage artifacts

#### 3. **snyk-go-backend**

- Performs security vulnerability scanning on Go dependencies
- Checks `go.mod` for vulnerabilities
- Severity threshold: HIGH
- Uploads results to GitHub Code Scanning
- Runs after unit tests complete

### 🟢 Frontend (React) Jobs

#### 4. **react-unit-tests**

- Runs unit tests using Playwright
- Focuses on reducer tests
- Command: `npm run test:playwright:unit`
- Uploads test reports

#### 5. **react-integration-tests**

- Runs E2E component tests using Playwright
- Command: `npm run test:playwright:e2e`
- Uploads test reports

#### 6. **react-coverage**

- Generates comprehensive coverage report
- Runs all tests with coverage instrumentation
- Uses NYC for coverage reporting
- Uploads coverage artifacts (HTML, LCOV, JSON)

#### 7. **snyk-react-frontend**

- Performs security vulnerability scanning on npm dependencies
- Checks `package.json` for vulnerabilities
- Severity threshold: HIGH
- Uploads results to GitHub Code Scanning
- Runs after unit tests complete

### 📊 Summary Job

#### 8. **test-summary**

- Aggregates all test results
- Downloads all artifacts
- Creates a summary in GitHub Actions interface
- Runs after all tests complete (always executes)

## Triggers

The workflow runs on:

- **Push** to `main` or `develop` branches
- **Pull Request** to `main` or `develop` branches
- **Manual trigger** via `workflow_dispatch`

## Prerequisites

### Required Secrets

You need to configure the following secret in your GitHub repository:

1. **SNYK_TOKEN**: Your Snyk authentication token
   - Go to: Repository Settings → Secrets and variables → Actions → New repository secret
   - Name: `SNYK_TOKEN`
   - Value: Your Snyk API token (from https://app.snyk.io/account)

### Setup Steps

1. **Authenticate Snyk** (Already completed ✅)

   ```bash
   snyk auth
   ```

2. **Add Project to Snyk** (Already completed ✅)

   ```bash
   snyk monitor
   ```

3. **Add Snyk Token to GitHub** (Already completed ✅)
   - Settings → Secrets and variables → Actions
   - Add `SNYK_TOKEN` secret

## Workflow Features

### ✨ Highlights

- **Parallel Execution**: Independent jobs run in parallel for faster results
- **Caching**: Go modules and npm dependencies are cached for faster builds
- **Artifacts**: Test reports and coverage files are saved for 30 days
- **Code Scanning**: Security issues appear in GitHub's Security tab
- **Continue on Error**: Snyk scans won't fail the workflow (continues for visibility)
- **Comprehensive Coverage**: Both unit and integration tests for both applications

### 📦 Artifacts Generated

The workflow generates the following artifacts:

1. **go-unit-coverage**: Go unit test coverage files
2. **go-integration-coverage**: Go integration test coverage files and HTML report
3. **react-unit-test-report**: React unit test Playwright report
4. **react-integration-test-report**: React integration test Playwright report
5. **react-coverage-report**: React coverage report (HTML, LCOV, JSON)

## Viewing Results

### Test Results

- Navigate to Actions tab → Select workflow run
- View job summaries and logs
- Download artifacts for detailed reports

### Coverage Reports

- Download artifacts from the workflow run
- Open HTML files in a browser:
  - Go: `integration_coverage.html`
  - React: `coverage/index.html`

### Security Scan Results

- Navigate to Security tab → Code scanning
- View Snyk findings categorized by severity
- Each finding includes:
  - Description
  - Severity level
  - Remediation advice
  - Affected files

## Local Testing

Before pushing, you can run tests locally:

### Backend (Go)

```bash
cd golang-gin-realworld-example-app

# Unit tests
go test ./users -v -run "^TestUnit"
go test ./articles -v -run "^TestUnit"
go test ./common -v -run "^TestUnit"

# Integration tests
chmod +x run_integration_tests.sh
./run_integration_tests.sh

# Snyk scan
snyk test
```

### Frontend (React)

```bash
cd react-redux-realworld-example-app

# Install dependencies
npm ci
npx playwright install --with-deps

# Unit tests
npm run test:playwright:unit

# Integration tests
npm run test:playwright:e2e

# Coverage
npm run test:coverage:all

# Snyk scan
snyk test
```

## Troubleshooting

### Common Issues

1. **Snyk Token Not Found**

   - Ensure `SNYK_TOKEN` is added to repository secrets
   - Check token hasn't expired

2. **Tests Failing**

   - Check test logs in Actions tab
   - Run tests locally to reproduce
   - Review code changes that may have broken tests

3. **Coverage Not Generated**

   - Ensure tests are running successfully
   - Check artifact upload logs
   - Verify file paths in workflow

4. **Playwright Browser Installation Fails**
   - The workflow uses `npx playwright install --with-deps`
   - If issues persist, check Playwright version compatibility

## Maintenance

### Updating Dependencies

When updating dependencies:

1. Run Snyk locally first: `snyk test`
2. Fix high/critical vulnerabilities before pushing
3. Update `go.mod` or `package.json` as needed
4. Push changes to trigger workflow

### Modifying Workflow

The workflow file is located at:

```
.github/workflows/snyk-security-and-tests.yml
```

Key sections to modify:

- **Triggers**: `on:` section
- **Node/Go versions**: `uses: actions/setup-*` steps
- **Test commands**: `run:` sections in each job
- **Security threshold**: `--severity-threshold=high` in Snyk steps

## Best Practices

1. ✅ Always run tests locally before pushing
2. ✅ Review Snyk findings regularly
3. ✅ Keep dependencies updated
4. ✅ Monitor workflow execution times
5. ✅ Download and review coverage reports
6. ✅ Fix security issues promptly
7. ✅ Use branch protection rules requiring workflow success

## Workflow Optimization

The workflow is optimized for:

- **Speed**: Parallel job execution, dependency caching
- **Reliability**: Continue on error for scans, always run summary
- **Visibility**: Comprehensive artifacts, GitHub summaries
- **Security**: Regular vulnerability scanning, code scanning integration

## Support

For issues or questions:

- Check workflow logs in Actions tab
- Review this README
- Consult Snyk documentation: https://docs.snyk.io
- Check GitHub Actions documentation: https://docs.github.com/actions

---

**Last Updated**: November 10, 2025
**Workflow Version**: 1.0.0
