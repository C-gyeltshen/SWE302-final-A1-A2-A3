# GitHub Workflow - Visual Architecture

## Workflow Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     TRIGGER: Push/PR to main/develop                         │
│                          or Manual Workflow Dispatch                         │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────────┐ ┌───────────────────────┐
        │   BACKEND (Go) PATH   │ │  FRONTEND (React) PATH │
        └───────────┬───────────┘ └───────────┬───────────┘
                    │                         │
                    │                         │
    ┌───────────────┼─────────────┐          │
    │               │             │          │
    ▼               ▼             ▼          │
┌────────┐    ┌──────────┐  ┌─────────┐     │
│ Unit   │    │Integration│  │  Snyk   │     │
│ Tests  │───▶│  Tests    │  │ Backend │     │
│ (Go)   │    │   (Go)    │  │  Scan   │     │
└────────┘    └──────────┘  └─────────┘     │
   2-3 min      3-5 min       1-2 min        │
                                             │
                ┌────────────────────────────┼─────────────────┐
                │                            │                 │
                ▼                            ▼                 ▼
         ┌────────────┐              ┌────────────┐    ┌────────────┐
         │   Unit     │              │Integration │    │   Snyk     │
         │   Tests    │─────────────▶│   Tests    │    │  Frontend  │
         │  (React)   │              │  (React)   │    │   Scan     │
         └────────────┘              └─────┬──────┘    └────────────┘
            2-3 min                        │              1-2 min
                                           │
                                           ▼
                                    ┌────────────┐
                                    │  Coverage  │
                                    │   Report   │
                                    │  (React)   │
                                    └─────┬──────┘
                                          │
                                          │ 3-5 min
                ┌─────────────────────────┴─────────────────────────┐
                │                                                    │
                ▼                                                    ▼
    ┌──────────────────────┐                          ┌──────────────────────┐
    │  Upload Artifacts    │                          │  Upload Artifacts    │
    │  - Go Coverage       │                          │  - React Reports     │
    │  - Test Reports      │                          │  - Coverage Files    │
    └──────────────────────┘                          └──────────────────────┘
                │                                                    │
                └─────────────────────┬──────────────────────────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │   Test Summary    │
                            │   (Always Runs)   │
                            └─────────┬─────────┘
                                      │
                                      ▼
                            ┌───────────────────┐
                            │  Workflow Complete│
                            │  Artifacts Saved  │
                            │  Reports Generated│
                            └───────────────────┘
```

## Job Dependencies

```
Parallel Execution Groups:

GROUP 1 (Start Immediately):
├─ go-unit-tests          ──┐
└─ react-unit-tests       ──┼─→ Can run in parallel
                            │
GROUP 2 (After Group 1):    │
├─ go-integration-tests   ──┤
├─ snyk-go-backend        ──┤  Wait for go-unit-tests
├─ react-integration-tests──┤  Wait for react-unit-tests
└─ snyk-react-frontend    ──┘  Wait for react-unit-tests
                            │
GROUP 3 (After Group 2):    │
└─ react-coverage         ──┘  Wait for react unit+integration
                            │
GROUP 4 (After All):        │
└─ test-summary           ──┘  Wait for everything
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        CODE REPOSITORY                          │
└───────────┬─────────────────────────────────┬──────────────────┘
            │                                 │
            │ golang-gin-realworld-          │ react-redux-realworld-
            │ example-app/                   │ example-app/
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│   Go Test Execution   │         │  React Test Execution │
│   ─────────────────   │         │  ──────────────────── │
│   • go test ./users   │         │  • Playwright unit    │
│   • go test ./articles│         │  • Playwright E2E     │
│   • go test ./common  │         │  • NYC coverage       │
│   • Integration suite │         │                       │
└──────────┬────────────┘         └──────────┬────────────┘
           │                                 │
           ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│  Coverage Generation  │         │  Coverage Generation  │
│  ──────────────────── │         │  ──────────────────── │
│  • .out files         │         │  • HTML reports       │
│  • HTML reports       │         │  • LCOV files         │
│  • Function coverage  │         │  • JSON data          │
└──────────┬────────────┘         └──────────┬────────────┘
           │                                 │
           ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│  Snyk Security Scan   │         │  Snyk Security Scan   │
│  ──────────────────── │         │  ──────────────────── │
│  • go.mod analysis    │         │  • package.json scan  │
│  • Vulnerability check│         │  • Dependency audit   │
│  • SARIF generation   │         │  • SARIF generation   │
└──────────┬────────────┘         └──────────┬────────────┘
           │                                 │
           └─────────────┬───────────────────┘
                        ▼
            ┌──────────────────────┐
            │  GitHub Code Scanning│
            │  ───────────────────│
            │  • Security findings │
            │  • Severity ratings  │
            │  • Remediation steps │
            └──────────────────────┘
                        │
                        ▼
            ┌──────────────────────┐
            │   Artifact Storage   │
            │   ──────────────────│
            │   30 days retention  │
            │   • Test reports     │
            │   • Coverage files   │
            │   • SARIF files      │
            └──────────────────────┘
```

## Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    First Workflow Run                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│  Go Modules   │   │ npm packages │   │   Playwright │
│  Download     │   │  Install     │   │   Browsers   │
│  (slow)       │   │  (slow)      │   │   (slow)     │
└───────┬───────┘   └──────┬───────┘   └──────┬───────┘
        │                  │                   │
        │ Cache Key:       │ Cache Key:        │ Included in
        │ go.sum hash      │ package-lock.json │ npm install
        │                  │                   │
        ▼                  ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│ Save to Cache │   │ Save to Cache│   │ Auto-cached  │
└───────────────┘   └──────────────┘   └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 Subsequent Workflow Runs                     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│ Restore Cache │   │ Restore Cache│   │ Restore Cache│
│ (fast - sec)  │   │ (fast - sec) │   │ (fast - sec) │
└───────────────┘   └──────────────┘   └──────────────┘
```

## Security Integration

```
┌─────────────────────────────────────────────────────────────┐
│                      Snyk Workflow                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │  Snyk Authentication      │
            │  (Using SNYK_TOKEN secret)│
            └───────────┬───────────────┘
                        │
        ┌───────────────┼───────────────┐
        │                               │
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│   Go Backend     │          │  React Frontend  │
│   Dependency     │          │   Dependency     │
│   Analysis       │          │    Analysis      │
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ Find Vulns in:   │          │ Find Vulns in:   │
│ • Direct deps    │          │ • Direct deps    │
│ • Transitive deps│          │ • Transitive deps│
│ • go.mod         │          │ • package.json   │
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         └──────────────┬───────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Filter by Severity   │
            │  (HIGH and CRITICAL)  │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Generate SARIF File  │
            │  (Security Report)    │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │ Upload to GitHub      │
            │ Code Scanning         │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Visible in:          │
            │  Security → Code      │
            │  Scanning Tab         │
            └───────────────────────┘
```

## Artifact Generation

```
┌─────────────────────────────────────────────────────────────┐
│                      Test Execution                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    Go Unit          Go Integration       React Tests
    Coverage         Coverage             & Coverage
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ *.out files  │   │ *.out files  │   │ playwright-  │
│              │   │ coverage.html│   │ report/      │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Upload as Artifacts  │
              │  ──────────────────── │
              │  Retention: 30 days   │
              │  Downloadable via UI  │
              │  or GitHub CLI        │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Available For:      │
              │   • Local viewing     │
              │   • Trend analysis    │
              │   • Compliance        │
              │   • Documentation     │
              └───────────────────────┘
```

## Time & Resource Optimization

```
┌──────────────────────────────────────────────────────────┐
│            Workflow Execution Timeline                   │
└──────────────────────────────────────────────────────────┘

Without Parallelization (Sequential):
├─ go-unit-tests         [██████████] 3 min
├─ go-integration-tests  [████████████████] 5 min
├─ snyk-go-backend       [████] 2 min
├─ react-unit-tests      [██████████] 3 min
├─ react-integration     [████████████████] 5 min
├─ snyk-react-frontend   [████] 2 min
├─ react-coverage        [████████████████] 5 min
└─ test-summary          [█] 0.5 min
Total: ~25.5 minutes

With Parallelization (Current):
├─ go-unit-tests         [██████████] 3 min      ┐
├─ react-unit-tests      [██████████] 3 min      ├─ Parallel
├─ go-integration        [████████████████] 5 min├─ Group 1
├─ react-integration     [████████████████] 5 min┘
├─ snyk-go-backend       [████] 2 min            ┐
├─ snyk-react-frontend   [████] 2 min            ├─ Parallel
└─ react-coverage        [████████████████] 5 min┘  Group 2
└─ test-summary          [█] 0.5 min
Total: ~12-18 minutes (50-60% faster!)
```

## Resource Usage

```
┌─────────────────────────────────────────────────────────┐
│              GitHub Actions Minutes Usage                │
└─────────────────────────────────────────────────────────┘

Per Workflow Run:
├─ Setup & Checkout       : ~1 minute
├─ Cache Operations       : ~1-2 minutes (or 10+ without cache)
├─ Test Execution         : ~8-12 minutes
├─ Security Scans         : ~2-4 minutes
├─ Artifact Upload        : ~1-2 minutes
└─ Summary Generation     : ~0.5 minutes
────────────────────────────────────────────────────────────
Total: ~15-20 minutes per run

Monthly Estimate (assuming 50 runs/month):
15-20 min × 50 = 750-1000 minutes/month

GitHub Free Tier: 2000 minutes/month ✅
Well within limits!
```

---

**Last Updated**: November 10, 2025  
**Workflow Version**: 1.0.0
