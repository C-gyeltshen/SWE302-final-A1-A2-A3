# Quick Reference - GitHub Workflow Commands

## 🚀 Running the Workflow

### Automatically Triggered
The workflow runs automatically when you:
```bash
# Push to main or develop
git push origin main
git push origin develop

# Create a pull request to main or develop
gh pr create --base main
```

### Manual Trigger
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Snyk Security & Testing Pipeline"
4. Click "Run workflow" button
5. Select branch and click "Run workflow"

## 📊 Viewing Results

### Via GitHub UI
```
1. Actions tab → Select workflow run
2. Click on individual jobs to see logs
3. Scroll down to "Artifacts" section to download reports
4. Security tab → Code scanning (for Snyk results)
```

### Via GitHub CLI
```bash
# List recent workflow runs
gh run list --workflow=snyk-security-and-tests.yml

# View specific run
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

## 🧪 Test Commands Reference

### Backend (Go)

```bash
cd golang-gin-realworld-example-app

# Run all unit tests
go test ./users -v -run "^TestUnit" -coverprofile=users_unit.out
go test ./articles -v -run "^TestUnit" -coverprofile=articles_unit.out
go test ./common -v -run "^TestUnit" -coverprofile=common_unit.out

# Run all integration tests
./run_integration_tests.sh

# View coverage
go tool cover -html=users_unit.out
go tool cover -html=integration_coverage.html

# Run specific test
go test ./users -v -run TestUnitCreateUser
```

### Frontend (React)

```bash
cd react-redux-realworld-example-app

# Install dependencies
npm ci
npx playwright install --with-deps

# Run unit tests (reducers)
npm run test:playwright:unit

# Run integration tests (E2E)
npm run test:playwright:e2e

# Run all tests
npm run test:playwright

# Run with coverage
npm run test:coverage:all

# View coverage report
open coverage/index.html

# Run specific test file
npx playwright test test/reducers/auth.spec.js

# Run in UI mode (debug)
npm run test:playwright:ui

# View test report
npm run test:playwright:report
```

## 🔒 Snyk Commands

### Backend (Go)
```bash
cd golang-gin-realworld-example-app

# Test for vulnerabilities
snyk test

# Monitor project (send to Snyk dashboard)
snyk monitor

# Test with specific severity
snyk test --severity-threshold=high

# Fix vulnerabilities
snyk fix
```

### Frontend (React)
```bash
cd react-redux-realworld-example-app

# Test for vulnerabilities
snyk test

# Monitor project
snyk monitor

# Test with specific severity
snyk test --severity-threshold=high

# Fix vulnerabilities
snyk fix
```

## 🔧 Workflow Maintenance

### Update Workflow File
```bash
# Edit workflow
code .github/workflows/snyk-security-and-tests.yml

# Commit and push
git add .github/workflows/snyk-security-and-tests.yml
git commit -m "Update workflow configuration"
git push origin main
```

### Disable Workflow
```yaml
# Add to workflow file at top level
on:
  workflow_dispatch:  # Only manual triggers
```

### Re-run Failed Jobs
```bash
# Via GitHub CLI
gh run rerun <run-id>

# Re-run only failed jobs
gh run rerun <run-id> --failed
```

## 📦 Artifact Management

### Download All Artifacts (CLI)
```bash
# Download from specific run
gh run download <run-id>

# Download specific artifact
gh run download <run-id> -n react-coverage-report

# List artifacts
gh api /repos/:owner/:repo/actions/runs/<run-id>/artifacts
```

### View Coverage Files
```bash
# After downloading artifacts
cd react-coverage-report
open index.html

cd ../go-integration-coverage
open integration_coverage.html
```

## 🎯 Common Scenarios

### Scenario 1: Fix Security Vulnerability
```bash
# 1. Check Snyk findings
snyk test

# 2. Update vulnerable package
# For Go:
go get -u package-name@version

# For React:
npm update package-name

# 3. Test locally
go test ./...  # Go
npm test      # React

# 4. Push changes
git add .
git commit -m "Fix: Update vulnerable dependency"
git push origin main
```

### Scenario 2: Test Fails in CI but Passes Locally
```bash
# 1. Download test artifacts from failed run
gh run download <run-id>

# 2. Check environment differences
# - Node/Go versions
# - Dependencies versions
# - Environment variables

# 3. Run tests in clean environment
# For Go:
rm -rf ~/go/pkg/mod
go mod download
go test ./...

# For React:
rm -rf node_modules
npm ci
npm test
```

### Scenario 3: Add New Test Suite
```yaml
# Add new job to workflow
new-test-suite:
  name: New Test Suite
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run new tests
      run: |
        # Your test commands
```

## 🛠️ Debugging

### Enable Debug Logging
```bash
# Set secret in GitHub repo settings
ACTIONS_STEP_DEBUG = true
ACTIONS_RUNNER_DEBUG = true
```

### Check Job Logs
```bash
# Via CLI
gh run view <run-id> --log

# Download logs
gh run view <run-id> --log > workflow.log
```

### Test Workflow Locally
```bash
# Install act (GitHub Actions local runner)
brew install act  # macOS

# Run workflow locally
act -W .github/workflows/snyk-security-and-tests.yml
```

## 📈 Performance Tips

### Speed Up Workflow
1. **Enable caching** (already configured)
2. **Run independent jobs in parallel** (already configured)
3. **Limit test scope** for PRs
4. **Use matrix strategy** for multiple versions

### Reduce Costs
1. **Use self-hosted runners** for private repos
2. **Optimize artifact retention** (currently 30 days)
3. **Cancel redundant runs**

```yaml
# Add to workflow to cancel old runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## 🔔 Notifications

### Get Notifications for Failed Runs
```bash
# Via GitHub settings
Settings → Notifications → Actions

# Via Slack (add to workflow)
- uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
  if: failure()
```

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Snyk Documentation](https://docs.snyk.io)
- [Playwright Documentation](https://playwright.dev)
- [Go Testing](https://golang.org/pkg/testing/)

---

**Quick Commands Cheat Sheet**

```bash
# Run all tests locally
cd golang-gin-realworld-example-app && ./run_integration_tests.sh
cd ../react-redux-realworld-example-app && npm run test:playwright

# Check security
snyk test

# View latest workflow run
gh run list --workflow=snyk-security-and-tests.yml --limit 1

# Download latest artifacts
gh run download $(gh run list --workflow=snyk-security-and-tests.yml --limit 1 --json databaseId --jq '.[0].databaseId')
```
