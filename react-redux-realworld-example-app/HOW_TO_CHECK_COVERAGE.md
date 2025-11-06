# 📊 How to Check Test Coverage

## Quick Reference

### ✅ Method 1: Terminal Summary (Fastest)

```bash
npm run test:coverage
```

**Output**: Text summary in terminal showing:

```
File             | % Stmts | % Branch | % Funcs | % Lines |
-----------------|---------|----------|---------|---------|
All files        |   58.63 |    80.83 |   21.15 |   60.56 |
  article.js     |     100 |      100 |     100 |     100 |
  articleList.js |     100 |      100 |     100 |     100 |
  ...
```

---

### 🌐 Method 2: Interactive HTML Report (Best)

```bash
# Option A: Run tests + open report
npm run test:coverage && npm run coverage:view

# Option B: Just open existing report
npm run coverage:view
```

Or manually open: **`coverage/index.html`** in any browser

**Features**:

- 📊 Visual charts and graphs
- 🎨 Color-coded coverage (green = covered, red = not covered)
- 🔍 Click on files to see line-by-line coverage
- 📁 Browse by directory
- 📈 Sortable tables

---

### 📄 Method 3: Check Specific Files

#### In Terminal

```bash
# View coverage summary
cat coverage/lcov.info | grep -A 5 "SF:src/reducers/article.js"

# Or view text report
npm run test:coverage:report
```

#### In HTML Report

1. Open `coverage/index.html`
2. Click on "src/" folder
3. Click on "reducers/" folder
4. Click on any `.js` file to see:
   - ✅ Green lines = covered
   - ❌ Red lines = not covered
   - Yellow = partially covered

---

### 🔍 Method 4: VSCode Integration

Install **Coverage Gutters** extension:

1. Install from VSCode marketplace: `Coverage Gutters`
2. Run: `npm run test:coverage`
3. Open any source file in `src/`
4. Click "Watch" in the status bar
5. See coverage highlights directly in your editor!

**Benefits**:

- See coverage without leaving VSCode
- Real-time coverage indicators
- Color-coded line highlights

---

### 📊 Method 5: Check Specific Coverage Types

```bash
# HTML report (interactive)
open coverage/index.html

# LCOV report (for CI/CD tools)
cat coverage/lcov.info

# JSON report (programmatic access)
cat coverage/coverage-final.json | jq

# Text report (terminal friendly)
npx nyc report --reporter=text
```

---

## Understanding the Numbers

### Coverage Metrics Explained

| Metric         | What It Means                 | Example                              |
| -------------- | ----------------------------- | ------------------------------------ |
| **Statements** | % of code statements executed | `if (x) { y = 1; }` - both parts     |
| **Branches**   | % of if/else paths taken      | `if (x)` - both true AND false paths |
| **Functions**  | % of functions called         | Functions that were invoked          |
| **Lines**      | % of code lines executed      | Physical lines run                   |

### Color Codes in HTML Report

- 🟢 **Green (80-100%)**: Excellent coverage
- 🟡 **Yellow (50-80%)**: Moderate coverage
- 🔴 **Red (0-50%)**: Poor coverage
- ⚫ **Gray**: Not applicable

---

## Your Current Coverage Status

### ✅ Perfect Coverage (100%)

All reducer files:

- `article.js`
- `articleList.js`
- `auth.js`
- `common.js`
- `editor.js`
- `home.js`
- `profile.js`
- `settings.js`
- `actionTypes.js`

### ❌ No Coverage (0%)

Files that need tests:

- `agent.js` - API client
- `middleware.js` - Redux middleware
- `store.js` - Store configuration

### 📊 Overall Project

- **58.63%** statements
- **80.83%** branches
- **21.15%** functions
- **60.56%** lines

---

## Common Tasks

### Task: View Coverage for Last Test Run

```bash
npm run coverage:view
```

### Task: Update Coverage After Code Changes

```bash
npm run test:coverage
```

### Task: Check Coverage for Specific Test Suite

```bash
# Only reducer tests
npx nyc --reporter=text playwright test test/reducers

# Only component tests
npx nyc --reporter=text playwright test test/components
```

### Task: Check if Coverage Meets Threshold

```bash
# Check if coverage is above 80%
npx nyc check-coverage --lines 80 --functions 80 --branches 80
```

### Task: View Coverage Diff Between Runs

```bash
# Save current coverage
cp coverage/coverage-final.json coverage-before.json

# Make changes and run tests
npm run test:coverage

# Compare (you'll need to install a diff tool)
diff coverage-before.json coverage/coverage-final.json
```

---

## Where Coverage Files Are Located

```
react-redux-realworld-example-app/
├── coverage/                    ← Generated reports (git ignored)
│   ├── index.html              ← 🌟 Main HTML report - START HERE
│   ├── lcov-report/            ← Detailed HTML per file
│   │   ├── index.html
│   │   └── src/
│   │       ├── reducers/
│   │       │   ├── article.js.html
│   │       │   └── ...
│   │       └── ...
│   ├── lcov.info               ← LCOV format (CI/CD)
│   └── coverage-final.json     ← JSON format
│
├── .nyc_output/                ← Raw coverage data (git ignored)
│   └── *.json                  ← Coverage from each test
│
└── .nycrc                      ← NYC configuration
```

---

## Pro Tips

### 💡 Tip 1: Always Check Coverage Before Commits

```bash
# Add to your workflow
npm run test:coverage
git add .
git commit -m "Your message"
```

### 💡 Tip 2: Set Up Pre-commit Hook

```bash
# Create .husky/pre-commit
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi
```

### 💡 Tip 3: Focus on What Matters

- Don't obsess over 100% coverage
- Focus on business logic and complex code
- Config files and simple getters are OK to skip

### 💡 Tip 4: Use HTML Report for Understanding

- The HTML report shows **exact lines** not covered
- Click on files to see what to test next
- Look for red/yellow sections

### 💡 Tip 5: Track Coverage Over Time

```bash
# Save coverage percentage
npm run test:coverage | grep "All files" | tee coverage-stats.txt
```

---

## Troubleshooting

### "No coverage directory found"

**Run**: `npm run test:coverage` first to generate reports

### "Coverage shows 0%"

**Check**: Are you using `npm run test:coverage` (not `npm test`)?

### "Can't open HTML report"

**Try**: `open coverage/index.html` (macOS) or manually open in browser

### "Old coverage showing"

**Fix**: Delete coverage folder and regenerate:

```bash
rm -rf coverage .nyc_output
npm run test:coverage
```

---

## Summary: Your Quick Commands

```bash
# 1. Generate fresh coverage
npm run test:coverage

# 2. View HTML report
npm run coverage:view

# 3. See text summary
npm run test:coverage:report
```

**That's it!** The HTML report at `coverage/index.html` is your best friend for understanding coverage. 🎉
