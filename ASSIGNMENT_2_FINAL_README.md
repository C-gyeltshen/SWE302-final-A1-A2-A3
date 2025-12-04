# Assignment 2: Static & Dynamic Application Security Testing (SAST & DAST)

## Overview

Tn this assignment we will perform security testing on the provideed web applicatlion using both Static Application Security Testing (SAST) and Dynamic Application Security Testing (DAST) tools. We will identify the vulnerabilities present in the application, analyze the findings, and implement fixes to improve the security posture of the application.

## Learning Objectives

- Understand the difference between SAST and DAST
- Use industry-standard security testing tools (Snyk, SonarQube, OWASP ZAP)
- Identify common security vulnerabilities (OWASP Top 10)
- Analyze security findings and prioritize remediation
- Implement security fixes and verify improvements

---

## Part A: Static Application Security Testing (SAST)

### Prerequisites

- Both backend and frontend code accessible
- Docker installed (for SonarQube)
- npm/Node.js and Go installed

---

### **Task 1: SAST with Snyk**

---

### 1.1 Setup Snyk

#### Installation

```bash
# Install Snyk CLI
npm install -g snyk
```

![10](image/10.png)

```bash
# Authenticate (requires free Snyk account)
snyk auth
```

![11](image/11.png)

#### Create Snyk Account

1. Visit [https://snyk.io/](https://snyk.io/)
2. Sign up for a free account
3. Complete authentication in CLI
4. Link your project repository to Snyk dashboard

   ![12](image/12.png)

### 1.2 Backend Security Scan (Go)

#### Run Snyk on Backend

```bash
cd golang-gin-realworld-example-app

# Test for vulnerabilities
snyk test

# Test and generate JSON report
snyk test --json > snyk-backend-report.json

# Test for open source vulnerabilities
snyk test --all-projects

# Monitor project (uploads to Snyk dashboard)
snyk monitor
```

### `Analyze Findings`

![13](image/13.png)

- #### `Security Scan Results (Before Fixes)`

  A Snyk security scan identified 2 high-severity vulnerabilities in project dependencies:

  1. **go-sqlite3 (v1.14.15)**: Heap-based Buffer Overflow vulnerability. Requires upgrade to v1.14.18+
  2. **jwt-go (v3.2.0)**: Access Restriction Bypass vulnerability allowing potential JWT token forgery. Requires upgrade to v4.0.0+ or migration to the maintained fork `github.com/golang-jwt/jwt`

  **Status**: ⚠️ Vulnerabilities identified - security updates recommended before production deployment.

  Total dependencies tested: 67 | Vulnerable paths: 3

  ![14](image/14.png)

- #### `Security Scan Results (After Fixes)`

  After updating the vulnerable dependencies, a follow-up Snyk scan confirmed that all previously identified vulnerabilities have been resolved.

  Total dependencies tested: 67 | Vulnerable paths: 0

  ![16](image/16.png)

  ![17](image/17.png)

### 1.3 Frontend Security Scan (React)

#### Run Snyk on Frontend

```bash
cd react-redux-realworld-example-app

# Test for vulnerabilities
snyk test

# Generate JSON report
snyk test --json > snyk-frontend-report.json

# Test for code vulnerabilities (not just dependencies)
snyk code test

# Generate code analysis report
snyk code test --json > snyk-code-report.json

# Monitor project
snyk monitor
```

### `Analyze Findings`

![15](image/15.png)

- #### Security Scan Results

  A Snyk security scan identified 6 vulnerabilities across 2 packages:

  1. **marked (v0.3.19)**: 5 Medium-severity Regular Expression Denial of Service (ReDoS) vulnerabilities. Requires upgrade to v4.0.10+
  2. **form-data (v2.3.3)**: 1 Critical-severity Predictable Value Range vulnerability (introduced via superagent@3.8.3). Requires upgrading superagent to v10.2.2+

  **Status**: ⚠️ Security updates required - particularly critical vulnerability in form-data dependency.

  Total dependencies tested: 59 | Vulnerable paths: 6

  ![14](image/14.png)

- #### `Security Scan Results (After Fixes)`

  After updating the vulnerable dependencies, a follow-up Snyk scan confirmed that all previously identified vulnerabilities have been resolved.

  Total dependencies tested: 59 | Vulnerable paths: 0

  ![16](image/16.png)

  ![18](image/18.png)

---

### **Task 2: SAST with SonarQube**

---

### 2.1 Setup SonarQube

Setup Sonarqube via the cloud hosted method.

https://docs.sonarsource.com/sonarqube-cloud/getting-started/github

#### **2.2.1 Analyze Results**

#### **1. Overall Status `Quality Gate Status` : PASSED**
![19](image/19.png)

1.1 Security Rattings `A`

- 0 Open Issues - No security vulnerabilities found
- Grade: `A` (Green) - Best possible security rating
- What this means: No SQL injections, XSS vulnerabilities, or other security flaws detected

1.2 Reliability: Rating `E` 

- 1.5k Open Issues - You have 1,500 bugs/reliability issues
- Grade: E (Red) - Worst rating (A is best, E is worst)
- What this means: Your code has bugs that could cause crashes, null pointer exceptions, or incorrect behavior
- Priority: This should be your main focus area!

1.3 Maintainability: Rating B 

- 4.2k Open Issues - You have 4,200 code smells
- Grade: B (Light Green) - Good, but room for improvement
- What this means: Code has some maintainability issues (complex functions, duplicated code, etc.) but overall acceptable

1.4 Duplications: 13.7% ⚠️ (HIGH)

- 13.7% of code is duplicated across 45k lines
- Status: "No conditions set" - Not blocking your quality gate
- What this means: You have significant code duplication
- Recommendation: Should be reduced to under 3%

    ![21](image/21.png)


#### **2. Security Hotspots by Category and Priority**

![20](image/20.png)

| Priority | Category | Count | Risk Level | OWASP Category |
|----------|----------|-------|------------|----------------|
| 🔴 **High** | **Authentication** | **15** | **Critical** | A07:2021 – Identification and Authentication Failures |
| 🟠 **Medium** | **Denial of Service (DoS)** | **3** | **High** | A05:2021 – Security Misconfiguration |
| 🟠 **Medium** | **Permission** | **2** | **High** | A01:2021 – Broken Access Control |
| 🟠 **Medium** | **Code Injection (RCE)** | **2** | **Critical** | A03:2021 – Injection |
| 🟠 **Medium** | **Weak Cryptography** | **6** | **High** | A02:2021 – Cryptographic Failures |
| 🟡 **Low** | **Others** | **4** | **Low** | Various |
| | **TOTAL** | **32** | | |

## Part B: Dynamic Application Security Testing (DAST)

## Task 3: DAST with OWASP ZAP (100 points)

### 3.1 Setup OWASP ZAP

```bash
docker pull zaproxy/zap-stable
```
![22](image/22.png)

### 3.2 Prepare Application for Testing

#### Start Full Stack
```bash
# Terminal 1: Backend
cd golang-gin-realworld-example-app
go run hello.go

# Terminal 2: Frontend
cd react-redux-realworld-example-app
```
#### 3.3 Passive Scan with OWASP ZAP

```bash
# Set the target in ZAP context
docker run --rm -v $(pwd):/zap/wrk/:rw -t zaproxy/zap-stable zap-baseline.sh -t http://localhost:4100 -r passive-report.html
```

  ![23](image/23.png)

  ![24](image/24.png)

#### ZAP Baseline Scan Summary

| Category | Count | Notes |
|----------|-------|--------|
| **PASS** | 56 | No issues found for these checks |
| **WARN-NEW** | 11 | Missing headers, CSP issues, server info leaks, caching issues |
| **FAIL-NEW** | 0 | No high-severity vulnerabilities detected |
| **INFO** | 0 | No informational alerts |
| **URLs Scanned** | 7 | Application crawled successfully |
| **Report File** | `passive-report.html` | Saved in current directory |


| Warning | Meaning |
|--------|---------|
| Missing Anti-clickjacking Header | Add `X-Frame-Options` |
| X-Content-Type-Options Missing | Add `nosniff` header |
| Server Leaks X-Powered-By | Hide technology stack |
| Content Security Policy Missing | Add CSP header |
| Storable & Cacheable Content | Add `Cache-Control` |
| Suspicious Comments | Remove TODO/DEBUG comments |
| Permissions-Policy Missing | Add Permissions-Policy |
| SRI Missing | Add integrity attributes |
| Spectre Isolation Weak | Browser-level notice |
| Modern Web App Detected | SPA behavior detected |

#### 3.4 Active Scan with OWASP ZAP

```bash








