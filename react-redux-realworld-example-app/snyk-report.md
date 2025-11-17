# Snyk Security Report - React Redux RealWorld Example App

**Date:** November 17, 2025  
**Project:** react-redux-realworld-example-app  
**Package Manager:** npm  
**Target File:** package-lock.json

## Summary

- **Total Dependencies Tested:** 59
- **Total Issues Found:** 6
- **Vulnerable Paths:** 6

## Vulnerabilities

### 1. marked@0.3.19 - Multiple ReDoS Vulnerabilities

**Package:** marked@0.3.19  
**Recommended Fix:** Upgrade to marked@4.0.10

#### Issues Found (5 vulnerabilities):

1. **Regular Expression Denial of Service (ReDoS)**

   - **Severity:** Medium
   - **Snyk ID:** SNYK-JS-MARKED-2342073
   - **URL:** https://security.snyk.io/vuln/SNYK-JS-MARKED-2342073
   - **Introduced by:** marked@0.3.19

2. **Regular Expression Denial of Service (ReDoS)**

   - **Severity:** Medium
   - **Snyk ID:** SNYK-JS-MARKED-2342082
   - **URL:** https://security.snyk.io/vuln/SNYK-JS-MARKED-2342082
   - **Introduced by:** marked@0.3.19

3. **Regular Expression Denial of Service (ReDoS)**

   - **Severity:** Medium
   - **Snyk ID:** SNYK-JS-MARKED-584281
   - **URL:** https://security.snyk.io/vuln/SNYK-JS-MARKED-584281
   - **Introduced by:** marked@0.3.19

4. **Regular Expression Denial of Service (ReDoS)**

   - **Severity:** Medium
   - **Snyk ID:** SNYK-JS-MARKED-174116
   - **URL:** https://security.snyk.io/vuln/SNYK-JS-MARKED-174116
   - **Introduced by:** marked@0.3.19

5. **Regular Expression Denial of Service (ReDoS)**
   - **Severity:** Medium
   - **Snyk ID:** SNYK-JS-MARKED-451540
   - **URL:** https://security.snyk.io/vuln/SNYK-JS-MARKED-451540
   - **Introduced by:** marked@0.3.19

### 2. form-data@2.3.3 - Predictable Value Range

**Package:** form-data@2.3.3  
**Severity:** Critical  
**Introduced by:** superagent@3.8.3 > form-data@2.3.3  
**Recommended Fix:** Upgrade superagent@3.8.3 to superagent@10.2.2

#### Issue Details:

- **Vulnerability:** Predictable Value Range from Previous Values
- **Severity:** Critical
- **Snyk ID:** SNYK-JS-FORMDATA-10841150
- **URL:** https://security.snyk.io/vuln/SNYK-JS-FORMDATA-10841150
- **Dependency Path:** superagent@3.8.3 > form-data@2.3.3

## Remediation Steps

### Priority 1: Critical Severity

```bash
# Upgrade superagent to fix form-data vulnerability
npm install superagent@10.2.2
```

### Priority 2: Medium Severity

```bash
# Upgrade marked to fix ReDoS vulnerabilities
npm install marked@4.0.10
```

## Additional Information

- **Organization:** c-gyeltshen
- **Open Source:** No
- **Licenses:** Enabled
- **Project Path:** /Users/chimigyeltshen/Desktop/Sem5/WEB302/swe302_assignments/react-redux-realworld-example-app

## Notes

All vulnerabilities can be fixed by upgrading the affected dependencies to the recommended versions. The critical vulnerability in form-data should be prioritized for immediate remediation.
