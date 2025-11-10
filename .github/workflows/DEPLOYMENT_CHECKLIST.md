# GitHub Workflow - Pre-Deployment Checklist

## ✅ Pre-Deployment Verification

### 1. Snyk Setup
- [x] Snyk CLI installed
- [x] Snyk authenticated (`snyk auth`)
- [x] Backend project added to Snyk
- [x] Frontend project added to Snyk (if separate)
- [ ] Snyk token copied to clipboard
- [ ] `SNYK_TOKEN` added to GitHub repository secrets

**Verify Snyk Setup:**
```bash
# Check if authenticated
snyk auth

# Test backend
cd golang-gin-realworld-example-app
snyk test

# Test frontend
cd ../react-redux-realworld-example-app
snyk test
```

### 2. GitHub Repository Setup
- [ ] Repository exists: `C-gyeltshen/SWE302-final-A1-A2-A3`
- [ ] You have push access to the repository
- [ ] `.github/workflows/` directory exists
- [ ] Workflow files are ready to commit

**Verify Repository:**
```bash
# Check current repository
git remote -v

# Should show:
# origin  https://github.com/C-gyeltshen/SWE302-final-A1-A2-A3.git
```

### 3. GitHub Secrets Configuration
- [ ] Navigate to: Settings → Secrets and variables → Actions
- [ ] Click "New repository secret"
- [ ] Name: `SNYK_TOKEN`
- [ ] Value: Your Snyk API token
- [ ] Click "Add secret"

**Get Snyk Token:**
1. Visit: https://app.snyk.io/account
2. Click "Click to show" under API Token
3. Copy the token
4. Add to GitHub secrets

### 4. Local Test Verification

#### Backend Tests
```bash
cd golang-gin-realworld-example-app

# Unit tests should pass
go test ./users -v -run "^TestUnit"
go test ./articles -v -run "^TestUnit"
go test ./common -v -run "^TestUnit"

# Integration tests should pass
chmod +x run_integration_tests.sh
./run_integration_tests.sh
```

- [ ] All Go unit tests pass locally
- [ ] All Go integration tests pass locally
- [ ] Coverage reports generated successfully

#### Frontend Tests
```bash
cd react-redux-realworld-example-app

# Install dependencies
npm ci
npx playwright install --with-deps

# Unit tests should pass
npm run test:playwright:unit

# Integration tests should pass
npm run test:playwright:e2e

# Coverage should generate
npm run test:coverage:all
```

- [ ] All React unit tests pass locally
- [ ] All React integration tests pass locally
- [ ] Coverage reports generated successfully

### 5. File Verification

Check that all workflow files are created:

```bash
# List workflow files
ls -la .github/workflows/

# Should show:
# snyk-security-and-tests.yml      (Main workflow)
# WORKFLOW_README.md               (Documentation)
# QUICK_REFERENCE.md               (Quick guide)
# SETUP_SUMMARY.md                 (Setup summary)
# WORKFLOW_ARCHITECTURE.md         (Visual diagrams)
```

- [ ] `snyk-security-and-tests.yml` exists
- [ ] `WORKFLOW_README.md` exists
- [ ] `QUICK_REFERENCE.md` exists
- [ ] `SETUP_SUMMARY.md` exists
- [ ] `WORKFLOW_ARCHITECTURE.md` exists

### 6. Workflow File Validation

**Check YAML syntax:**
```bash
# Install yamllint (if not already installed)
brew install yamllint  # macOS

# Validate workflow file
yamllint .github/workflows/snyk-security-and-tests.yml
```

- [ ] No YAML syntax errors
- [ ] Proper indentation
- [ ] All required fields present

### 7. Dependencies Check

#### Go Dependencies
```bash
cd golang-gin-realworld-example-app
go mod verify
go mod tidy
```

- [ ] `go.mod` is valid
- [ ] `go.sum` is up to date
- [ ] No missing dependencies

#### React Dependencies
```bash
cd react-redux-realworld-example-app
npm audit
```

- [ ] `package.json` is valid
- [ ] `package-lock.json` exists
- [ ] Dependencies are installable

### 8. Git Status Check

```bash
# Check current branch
git branch

# Should be on: main

# Check git status
git status

# Check for uncommitted changes
git diff
```

- [ ] On correct branch (`main` or `develop`)
- [ ] No conflicting changes
- [ ] Ready to commit new files

## 🚀 Deployment Steps

### Step 1: Review Files
```bash
# Review workflow file
cat .github/workflows/snyk-security-and-tests.yml

# Review documentation
cat .github/workflows/WORKFLOW_README.md
```

- [ ] Workflow configuration looks correct
- [ ] Documentation is clear and helpful

### Step 2: Stage Files
```bash
# Add workflow files
git add .github/workflows/

# Verify what's being added
git status
```

- [ ] All workflow files are staged
- [ ] No unwanted files included

### Step 3: Commit
```bash
git commit -m "feat: Add comprehensive CI/CD workflow with Snyk security scanning

- Add GitHub Actions workflow for automated testing and security scanning
- Include unit and integration tests for Go backend
- Include unit and integration tests for React frontend  
- Add Snyk vulnerability scanning for both projects
- Add coverage reporting and artifact storage
- Add comprehensive documentation and guides

Jobs included:
- go-unit-tests: Run Go unit tests with coverage
- go-integration-tests: Run Go integration tests
- snyk-go-backend: Security scan for Go dependencies
- react-unit-tests: Run React Playwright unit tests
- react-integration-tests: Run React E2E tests
- react-coverage: Generate React coverage reports
- snyk-react-frontend: Security scan for npm dependencies
- test-summary: Aggregate results and create summary

Features:
- Parallel job execution for faster runs
- Dependency caching to improve speed
- 30-day artifact retention
- GitHub Code Scanning integration
- Comprehensive test coverage
- Security vulnerability detection"
```

- [ ] Commit created successfully
- [ ] Commit message is descriptive

### Step 4: Push to GitHub
```bash
git push origin main
```

- [ ] Push successful
- [ ] No errors during push

### Step 5: Verify Workflow Run

1. Go to GitHub: https://github.com/C-gyeltshen/SWE302-final-A1-A2-A3
2. Click "Actions" tab
3. Look for "Snyk Security & Testing Pipeline"
4. Click on the running workflow

- [ ] Workflow started automatically
- [ ] All jobs are visible
- [ ] Jobs are running in correct order

## 📊 First Run Verification

### Job Status Checks

Monitor each job during first run:

#### go-unit-tests
- [ ] Checkout successful
- [ ] Go setup complete (version 1.23.0)
- [ ] Cache restored (or created if first run)
- [ ] Dependencies downloaded
- [ ] Users module tests passed
- [ ] Articles module tests passed
- [ ] Common module tests passed
- [ ] Coverage generated
- [ ] Artifacts uploaded

#### go-integration-tests
- [ ] Checkout successful
- [ ] Go setup complete
- [ ] Integration script executed
- [ ] All integration tests passed
- [ ] Coverage HTML generated
- [ ] Artifacts uploaded

#### snyk-go-backend
- [ ] Checkout successful
- [ ] Go setup complete
- [ ] Snyk scan executed
- [ ] SARIF file generated
- [ ] Results uploaded to Code Scanning

#### react-unit-tests
- [ ] Checkout successful
- [ ] Node.js setup complete (version 16)
- [ ] Dependencies installed
- [ ] Playwright browsers installed
- [ ] Unit tests passed
- [ ] Test report generated
- [ ] Artifacts uploaded

#### react-integration-tests
- [ ] Checkout successful
- [ ] Dependencies installed
- [ ] E2E tests passed
- [ ] Test report generated
- [ ] Artifacts uploaded

#### react-coverage
- [ ] Checkout successful
- [ ] Coverage tests executed
- [ ] HTML report generated
- [ ] LCOV report generated
- [ ] Artifacts uploaded

#### snyk-react-frontend
- [ ] Checkout successful
- [ ] Node.js setup complete
- [ ] Dependencies installed
- [ ] Snyk scan executed
- [ ] SARIF file generated
- [ ] Results uploaded to Code Scanning

#### test-summary
- [ ] All artifacts downloaded
- [ ] Summary created
- [ ] Visible in workflow summary

## 🔍 Post-Deployment Verification

### 1. Check Workflow Status
```bash
# Using GitHub CLI
gh run list --workflow=snyk-security-and-tests.yml --limit 1

# Should show: ✓ completed
```

- [ ] Workflow completed successfully
- [ ] All jobs show green checkmarks
- [ ] No failed jobs

### 2. Download and Verify Artifacts

```bash
# Download artifacts from latest run
gh run download $(gh run list --workflow=snyk-security-and-tests.yml --limit 1 --json databaseId --jq '.[0].databaseId')

# List downloaded files
ls -R
```

- [ ] `go-unit-coverage/` directory exists
- [ ] `go-integration-coverage/` directory exists
- [ ] `react-unit-test-report/` directory exists
- [ ] `react-integration-test-report/` directory exists
- [ ] `react-coverage-report/` directory exists

### 3. Open Coverage Reports

```bash
# Open Go coverage
open go-integration-coverage/integration_coverage.html

# Open React coverage
open react-coverage-report/coverage/index.html
```

- [ ] Go coverage report opens in browser
- [ ] React coverage report opens in browser
- [ ] Coverage percentages are visible

### 4. Check Security Findings

1. Go to: Repository → Security → Code scanning
2. Look for Snyk findings

- [ ] Security tab is accessible
- [ ] Snyk findings are visible (if any)
- [ ] Findings show severity levels
- [ ] Remediation advice is available

### 5. Verify GitHub Summary

1. Go to: Actions → Latest workflow run
2. Scroll down to "Summary" section

- [ ] Test summary is visible
- [ ] All components marked as completed
- [ ] Artifacts section shows all uploads

## 🎯 Success Criteria

Your workflow is fully deployed when:

- [x] Snyk is authenticated and configured
- [x] GitHub secrets contain `SNYK_TOKEN`
- [x] All workflow files are committed
- [x] All local tests pass
- [ ] Workflow pushed to GitHub
- [ ] First workflow run completes successfully
- [ ] All 8 jobs complete with green checkmarks
- [ ] Artifacts are generated and downloadable
- [ ] Security scans complete without critical issues
- [ ] Coverage reports are accessible

## 🐛 Troubleshooting Common Issues

### Issue 1: Workflow Not Triggering
**Symptom**: No workflow appears in Actions tab  
**Solution**:
```bash
# Verify workflow file location
ls .github/workflows/snyk-security-and-tests.yml

# Check YAML syntax
yamllint .github/workflows/snyk-security-and-tests.yml

# Try manual trigger from GitHub UI
```

### Issue 2: Snyk Token Error
**Symptom**: "Missing Snyk token" error  
**Solution**:
1. Verify secret name is exactly `SNYK_TOKEN`
2. Check secret value is correct
3. Try regenerating token from Snyk dashboard

### Issue 3: Tests Fail in CI
**Symptom**: Tests pass locally but fail in workflow  
**Solution**:
```bash
# Check versions match
go version  # Should be 1.23.0
node --version  # Should be 16.x

# Run in clean environment
rm -rf node_modules && npm ci
rm -rf ~/go/pkg/mod && go mod download
```

### Issue 4: Artifacts Not Uploading
**Symptom**: No artifacts in workflow run  
**Solution**:
1. Check test execution logs
2. Verify file paths in workflow
3. Ensure tests generate coverage files
4. Check artifact upload step logs

## 📞 Getting Help

If you encounter issues:

1. **Check Documentation**:
   - Read `WORKFLOW_README.md`
   - Review `QUICK_REFERENCE.md`
   - Check `WORKFLOW_ARCHITECTURE.md`

2. **Review Logs**:
   - Actions → Workflow run → Job logs
   - Look for red error messages
   - Check for warning indicators

3. **Test Locally**:
   - Run all tests locally first
   - Verify Snyk authentication
   - Check dependency installations

4. **Resources**:
   - GitHub Actions Docs: https://docs.github.com/actions
   - Snyk Docs: https://docs.snyk.io
   - Playwright Docs: https://playwright.dev

## 🎉 Ready to Deploy!

When all items above are checked:

```bash
# Final verification
git status
git log -1

# Push to GitHub
git push origin main

# Watch it run
echo "Visit: https://github.com/C-gyeltshen/SWE302-final-A1-A2-A3/actions"
```

---

**Checklist Version**: 1.0.0  
**Last Updated**: November 10, 2025  
**Status**: Ready for deployment ✅

Good luck with your deployment! 🚀
