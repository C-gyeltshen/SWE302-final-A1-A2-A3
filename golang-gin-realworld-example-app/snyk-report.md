# Snyk Security Report - Golang Gin RealWorld Example App

**Date:** November 17, 2025  
**Project:** realworld-backend  
**Package Manager:** gomodules  
**Target File:** go.mod

## Summary

- **Total Dependencies Tested:** 67
- **Total Issues Found:** 2
- **Vulnerable Paths:** 3

## Vulnerabilities

### 1. github.com/mattn/go-sqlite3 - Heap-based Buffer Overflow

**Package:** github.com/mattn/go-sqlite3@1.14.15  
**Severity:** High  
**Recommended Fix:** Upgrade to version 1.14.18

#### Issue Details:

- **Vulnerability:** Heap-based Buffer Overflow
- **Severity:** High
- **Snyk ID:** SNYK-GOLANG-GITHUBCOMMATTNGOSQLITE3-6139875
- **URL:** https://security.snyk.io/vuln/SNYK-GOLANG-GITHUBCOMMATTNGOSQLITE3-6139875
- **Introduced Through:** github.com/jinzhu/gorm/dialects/sqlite@1.9.16
- **Dependency Path:** github.com/jinzhu/gorm/dialects/sqlite@1.9.16 > github.com/mattn/go-sqlite3@1.14.15
- **Fixed In:** 1.14.18

### 2. github.com/dgrijalva/jwt-go - Access Restriction Bypass

**Package:** github.com/dgrijalva/jwt-go@3.2.0  
**Severity:** High  
**Recommended Fix:** Upgrade to version 4.0.0-preview1

#### Issue Details:

- **Vulnerability:** Access Restriction Bypass
- **Severity:** High
- **Snyk ID:** SNYK-GOLANG-GITHUBCOMDGRIJALVAJWTGO-596515
- **URL:** https://security.snyk.io/vuln/SNYK-GOLANG-GITHUBCOMDGRIJALVAJWTGO-596515
- **Introduced Through:** github.com/dgrijalva/jwt-go@3.2.0, github.com/dgrijalva/jwt-go/request@3.2.0
- **Dependency Paths:**
  1. github.com/dgrijalva/jwt-go@3.2.0
  2. github.com/dgrijalva/jwt-go/request@3.2.0 > github.com/dgrijalva/jwt-go@3.2.0
- **Fixed In:** 4.0.0-preview1

## Remediation Steps

### For go-sqlite3 vulnerability:

```bash
# Update the go-sqlite3 dependency
go get -u github.com/mattn/go-sqlite3@v1.14.18
go mod tidy
```

### For jwt-go vulnerability:

**Note:** The jwt-go library is deprecated. Consider migrating to the maintained fork:

```bash
# Option 1: Upgrade to 4.0.0-preview1 (not recommended for production)
go get -u github.com/dgrijalva/jwt-go@v4.0.0-preview1

# Option 2: Migrate to the maintained fork (recommended)
go get -u github.com/golang-jwt/jwt/v5@latest
# Then update imports in your code from:
# github.com/dgrijalva/jwt-go
# to:
# github.com/golang-jwt/jwt/v5
```

After making changes, update your dependencies:

```bash
go mod tidy
go mod verify
```

## Additional Information

- **Organization:** c-gyeltshen
- **Open Source:** No
- **Licenses:** Enabled
- **Project Path:** /Users/chimigyeltshen/Desktop/Sem5/WEB302/swe302_assignments/golang-gin-realworld-example-app

## Notes

Both vulnerabilities are rated as **High severity** and should be addressed promptly. The jwt-go library is deprecated, and it's strongly recommended to migrate to the maintained fork `github.com/golang-jwt/jwt` instead of upgrading to the preview version.
