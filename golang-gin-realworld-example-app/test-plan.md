# Integration Test Plan for RealWorld Backend Application

## Overview

This document outlines a comprehensive integration test plan for the Golang Gin RealWorld Example App with target test coverage greater than 80%. The plan covers three main modules: **Articles**, **Users**, and **Common**.

## Test Environment Setup

### Prerequisites

- Go 1.16+
- SQLite3
- Testing frameworks:
  - `testing` (standard library)
  - `github.com/stretchr/testify/assert`
  - `net/http/httptest`
  - `github.com/gin-gonic/gin`

### Test Database Configuration

```go
// Use separate test database (gorm_test.db)
// Clean up after each test suite
// Automated migrations for all models
```

---

## Module 1: Users Module Integration Tests

### 1.1 User Registration & Authentication (Priority: High)

#### Test Case 1.1.1: Complete User Registration Flow

**Objective**: Verify end-to-end user registration process  
**Coverage Areas**:

- POST `/api/users` endpoint
- Database persistence
- Password hashing
- JWT token generation

**Test Steps**:

1. Send POST request with valid user data
2. Verify HTTP 201 status code
3. Verify user created in database with hashed password
4. Verify JWT token returned in response
5. Verify response contains user object with correct fields
6. Verify password is hashed (not plain text)

**Expected Coverage**: Routers, Models, Validators, Serializers

#### Test Case 1.1.2: User Registration with Duplicate Email

**Objective**: Test validation for duplicate user registration  
**Test Steps**:

1. Create a user with email "test@example.com"
2. Attempt to create another user with same email
3. Verify HTTP 422 status code
4. Verify error message in response

**Expected Coverage**: Models validation, Error handling

#### Test Case 1.1.3: User Registration with Invalid Data

**Objective**: Test input validation  
**Test Scenarios**:

- Missing required fields (username, email, password)
- Invalid email format
- Password too short
- Invalid username characters

**Expected Coverage**: Validators, Error handling

#### Test Case 1.1.4: User Login Flow

**Objective**: Verify complete login authentication  
**Test Steps**:

1. Create a user via registration
2. Send POST request to `/api/users/login` with correct credentials
3. Verify HTTP 200 status code
4. Verify JWT token generation
5. Verify token can be used for authenticated requests

**Expected Coverage**: Login validators, Password verification, JWT generation

#### Test Case 1.1.5: User Login with Invalid Credentials

**Objective**: Test authentication failure scenarios  
**Test Scenarios**:

- Non-existent email
- Incorrect password
- Missing credentials

**Expected Coverage**: Error handling, Security

### 1.2 User Profile Management (Priority: High)

#### Test Case 1.2.1: Retrieve Current User

**Objective**: Test authenticated user retrieval  
**Test Steps**:

1. Register and login a user
2. Send GET request to `/api/user` with auth token
3. Verify HTTP 200 status code
4. Verify user data in response

**Expected Coverage**: Auth middleware, User retrieval

#### Test Case 1.2.2: Update User Profile

**Objective**: Test user profile update functionality  
**Test Steps**:

1. Create authenticated user
2. Send PUT request to `/api/user` with updated data
3. Verify HTTP 200 status code
4. Verify database updated
5. Verify updated fields in response

**Fields to Update**: username, email, bio, image, password

**Expected Coverage**: Update validators, Models update

#### Test Case 1.2.3: Update User Without Authentication

**Objective**: Test authorization protection  
**Test Steps**:

1. Send PUT request to `/api/user` without token
2. Verify HTTP 401 status code

**Expected Coverage**: Auth middleware

### 1.3 Profile & Follow System (Priority: Medium)

#### Test Case 1.3.1: Retrieve User Profile

**Objective**: Test public profile retrieval  
**Test Steps**:

1. Create a user
2. Send GET request to `/api/profiles/:username`
3. Verify HTTP 200 status code
4. Verify profile data returned

**Expected Coverage**: Profile routers, Serializers

#### Test Case 1.3.2: Follow User

**Objective**: Test follow functionality  
**Test Steps**:

1. Create two users (A and B)
2. Authenticate as user A
3. Send POST request to `/api/profiles/:username/follow` for user B
4. Verify HTTP 200 status code
5. Verify following relationship in database
6. Verify profile response shows "following: true"

**Expected Coverage**: Follow models, Database relationships

#### Test Case 1.3.3: Unfollow User

**Objective**: Test unfollow functionality  
**Test Steps**:

1. Create follow relationship between users
2. Send DELETE request to `/api/profiles/:username/follow`
3. Verify HTTP 200 status code
4. Verify relationship removed from database
5. Verify profile response shows "following: false"

**Expected Coverage**: Unfollow models, Database cleanup

#### Test Case 1.3.4: Follow/Unfollow Non-existent User

**Objective**: Test error handling for invalid users  
**Test Steps**:

1. Authenticate as valid user
2. Attempt to follow/unfollow non-existent username
3. Verify HTTP 404 status code

**Expected Coverage**: Error handling

#### Test Case 1.3.5: Multiple Follow Relationships

**Objective**: Test complex follow scenarios  
**Test Steps**:

1. Create users A, B, C, D
2. A follows B, C, D
3. Verify GetFollowings() returns correct list
4. B follows A
5. Test mutual following scenarios

**Expected Coverage**: Complex model interactions

### 1.4 Authentication Middleware (Priority: High)

#### Test Case 1.4.1: Valid JWT Token Authentication

**Objective**: Test middleware with valid token  
**Test Steps**:

1. Generate valid JWT token
2. Make request to protected endpoint with token
3. Verify user context populated
4. Verify request succeeds

**Expected Coverage**: Auth middleware

#### Test Case 1.4.2: Invalid/Expired JWT Token

**Objective**: Test token validation  
**Test Scenarios**:

- Expired token
- Malformed token
- Invalid signature
- Missing token on protected route

**Expected Coverage**: Middleware error handling

#### Test Case 1.4.3: Optional Authentication (auto401=false)

**Objective**: Test middleware with optional auth  
**Test Steps**:

1. Send request to optional-auth endpoint without token
2. Verify request succeeds
3. Verify user context is empty

**Expected Coverage**: Middleware flexibility

---

## Module 2: Articles Module Integration Tests

### 2.1 Article CRUD Operations (Priority: High)

#### Test Case 2.1.1: Create Article

**Objective**: Test complete article creation flow  
**Test Steps**:

1. Authenticate as user
2. Send POST request to `/api/articles` with article data
3. Verify HTTP 201 status code
4. Verify article saved to database
5. Verify slug generation
6. Verify author association
7. Verify tags creation/association

**Expected Coverage**: Article routers, Models, Validators, Serializers

#### Test Case 2.1.2: Create Article with Multiple Tags

**Objective**: Test tag association  
**Test Steps**:

1. Create article with tags ["golang", "testing", "backend"]
2. Verify tags created in database
3. Verify many-to-many relationship established
4. Create another article with overlapping tags
5. Verify tag reuse (no duplicates)

**Expected Coverage**: Tag models, Many-to-many relationships

#### Test Case 2.1.3: Create Article Without Authentication

**Objective**: Test authorization  
**Test Steps**:

1. Send POST request without auth token
2. Verify HTTP 401 status code

**Expected Coverage**: Auth protection

#### Test Case 2.1.4: Create Article with Invalid Data

**Objective**: Test validation  
**Test Scenarios**:

- Missing title
- Missing description
- Missing body
- Empty fields

**Expected Coverage**: Validators

#### Test Case 2.1.5: List Articles

**Objective**: Test article listing with filters  
**Test Steps**:

1. Create multiple articles with different tags and authors
2. Test GET `/api/articles` without filters
3. Verify pagination (limit, offset)
4. Test with tag filter
5. Test with author filter
6. Test with favorited filter

**Expected Coverage**: List queries, Filtering logic

#### Test Case 2.1.6: Retrieve Single Article

**Objective**: Test article retrieval by slug  
**Test Steps**:

1. Create an article
2. Send GET request to `/api/articles/:slug`
3. Verify HTTP 200 status code
4. Verify complete article data returned

**Expected Coverage**: Article retrieval, Serialization

#### Test Case 2.1.7: Retrieve Non-existent Article

**Objective**: Test error handling  
**Test Steps**:

1. Send GET request with invalid slug
2. Verify HTTP 404 status code

**Expected Coverage**: Error handling

#### Test Case 2.1.8: Update Article

**Objective**: Test article update functionality  
**Test Steps**:

1. Create article as authenticated user
2. Send PUT request to `/api/articles/:slug` with updates
3. Verify HTTP 200 status code
4. Verify database updated
5. Verify slug updated if title changed

**Fields to Update**: title, description, body, tags

**Expected Coverage**: Update logic, Slug regeneration

#### Test Case 2.1.9: Update Article by Non-Author

**Objective**: Test authorization for updates  
**Test Steps**:

1. User A creates article
2. User B attempts to update article
3. Verify authorization check (should fail)

**Expected Coverage**: Authorization logic

#### Test Case 2.1.10: Delete Article

**Objective**: Test article deletion  
**Test Steps**:

1. Create article
2. Send DELETE request to `/api/articles/:slug`
3. Verify HTTP 200 status code
4. Verify article removed from database
5. Verify associated comments deleted (cascade)

**Expected Coverage**: Deletion logic, Cascade operations

#### Test Case 2.1.11: Delete Article by Non-Author

**Objective**: Test authorization for deletion  
**Test Steps**:

1. User A creates article
2. User B attempts to delete article
3. Verify authorization check (should fail)

**Expected Coverage**: Authorization logic

### 2.2 Favorite System (Priority: Medium)

#### Test Case 2.2.1: Favorite Article

**Objective**: Test favorite functionality  
**Test Steps**:

1. Create article and user
2. Send POST request to `/api/articles/:slug/favorite`
3. Verify HTTP 200 status code
4. Verify favorite record in database
5. Verify article response shows "favorited: true"
6. Verify favoritesCount incremented

**Expected Coverage**: Favorite models, Relationships

#### Test Case 2.2.2: Unfavorite Article

**Objective**: Test unfavorite functionality  
**Test Steps**:

1. Create favorite relationship
2. Send DELETE request to `/api/articles/:slug/favorite`
3. Verify HTTP 200 status code
4. Verify favorite removed from database
5. Verify article response shows "favorited: false"
6. Verify favoritesCount decremented

**Expected Coverage**: Unfavorite logic

#### Test Case 2.2.3: Favorite Same Article Multiple Times

**Objective**: Test idempotency  
**Test Steps**:

1. Favorite an article
2. Favorite same article again
3. Verify only one favorite record exists
4. Verify favoritesCount is 1

**Expected Coverage**: Duplicate prevention

#### Test Case 2.2.4: Multiple Users Favorite Same Article

**Objective**: Test concurrent favorites  
**Test Steps**:

1. Create article and 5 users
2. All users favorite the article
3. Verify 5 favorite records
4. Verify favoritesCount is 5

**Expected Coverage**: Count aggregation

#### Test Case 2.2.5: List Favorited Articles

**Objective**: Test filtering by favorited  
**Test Steps**:

1. User A favorites articles 1, 3, 5
2. Query `/api/articles?favorited=userA`
3. Verify only articles 1, 3, 5 returned

**Expected Coverage**: Query filters

### 2.3 Comments System (Priority: Medium)

#### Test Case 2.3.1: Create Comment

**Objective**: Test comment creation  
**Test Steps**:

1. Create article
2. Authenticate as user
3. Send POST request to `/api/articles/:slug/comments`
4. Verify HTTP 201 status code
5. Verify comment saved to database
6. Verify author association
7. Verify article association

**Expected Coverage**: Comment models, Validators

#### Test Case 2.3.2: List Article Comments

**Objective**: Test comment retrieval  
**Test Steps**:

1. Create article with multiple comments
2. Send GET request to `/api/articles/:slug/comments`
3. Verify HTTP 200 status code
4. Verify all comments returned
5. Verify comments ordered by creation date

**Expected Coverage**: Comment listing, Serialization

#### Test Case 2.3.3: Delete Comment

**Objective**: Test comment deletion  
**Test Steps**:

1. Create comment
2. Send DELETE request to `/api/articles/:slug/comments/:id`
3. Verify HTTP 200 status code
4. Verify comment removed from database

**Expected Coverage**: Comment deletion

#### Test Case 2.3.4: Delete Comment by Non-Author

**Objective**: Test authorization  
**Test Steps**:

1. User A creates comment
2. User B attempts to delete comment
3. Verify authorization check

**Expected Coverage**: Authorization logic

#### Test Case 2.3.5: Comments on Deleted Article

**Objective**: Test cascade deletion  
**Test Steps**:

1. Create article with comments
2. Delete article
3. Verify comments also deleted (cascade)

**Expected Coverage**: Foreign key constraints

### 2.4 Feed System (Priority: Medium)

#### Test Case 2.4.1: Get Article Feed

**Objective**: Test personalized feed  
**Test Steps**:

1. Create users A, B, C
2. User A follows users B and C
3. Users B and C create articles
4. User A requests GET `/api/articles/feed`
5. Verify only articles from B and C returned
6. Test pagination

**Expected Coverage**: Feed query logic, Following relationships

#### Test Case 2.4.2: Empty Feed for New User

**Objective**: Test edge case  
**Test Steps**:

1. Create user with no following
2. Request feed
3. Verify empty array returned

**Expected Coverage**: Empty state handling

#### Test Case 2.4.3: Feed Without Authentication

**Objective**: Test authorization  
**Test Steps**:

1. Request feed without auth token
2. Verify HTTP 401 status code

**Expected Coverage**: Auth protection

### 2.5 Tags System (Priority: Low)

#### Test Case 2.5.1: List All Tags

**Objective**: Test tag listing  
**Test Steps**:

1. Create articles with various tags
2. Send GET request to `/api/tags`
3. Verify HTTP 200 status code
4. Verify all unique tags returned

**Expected Coverage**: Tag aggregation

#### Test Case 2.5.2: Empty Tag List

**Objective**: Test edge case  
**Test Steps**:

1. Empty database
2. Request tags
3. Verify empty array returned

**Expected Coverage**: Empty state handling

---

## Module 3: Common Module Integration Tests

### 3.1 Database Operations (Priority: High)

#### Test Case 3.1.1: Database Connection

**Objective**: Test database initialization  
**Test Steps**:

1. Call `common.Init()`
2. Verify database connection established
3. Verify database file created
4. Test connection pool
5. Test concurrent connections

**Expected Coverage**: Database initialization

#### Test Case 3.1.2: Test Database Lifecycle

**Objective**: Test test database management  
**Test Steps**:

1. Call `common.TestDBInit()`
2. Verify test database created separately
3. Perform operations
4. Call `common.TestDBFree()`
5. Verify test database removed

**Expected Coverage**: Test utilities

#### Test Case 3.1.3: Database Migration

**Objective**: Test auto-migration  
**Test Steps**:

1. Initialize database
2. Run AutoMigrate for all models
3. Verify all tables created
4. Verify relationships established
5. Verify indexes created

**Expected Coverage**: Schema management

#### Test Case 3.1.4: Database Connection Pool

**Objective**: Test connection management  
**Test Steps**:

1. Configure max idle connections
2. Perform multiple concurrent queries
3. Verify connection reuse
4. Verify no connection leaks

**Expected Coverage**: Connection pooling

#### Test Case 3.1.5: Database Error Handling

**Objective**: Test error scenarios  
**Test Scenarios**:

- Database file permissions error
- Connection timeout
- Query execution errors

**Expected Coverage**: Error handling

### 3.2 Utility Functions (Priority: Medium)

#### Test Case 3.2.1: JWT Token Generation

**Objective**: Test token creation  
**Test Steps**:

1. Generate token with user ID
2. Verify token format (JWT structure)
3. Verify token length
4. Verify expiration time (24 hours)
5. Parse token and verify claims

**Expected Coverage**: JWT utilities

#### Test Case 3.2.2: JWT Token Validation

**Objective**: Test token verification  
**Test Steps**:

1. Generate valid token
2. Verify token can be parsed
3. Test expired token rejection
4. Test tampered token rejection
5. Test invalid signature rejection

**Expected Coverage**: Token security

#### Test Case 3.2.3: Random String Generation

**Objective**: Test RandString utility  
**Test Steps**:

1. Generate strings of various lengths (0, 10, 100)
2. Verify correct length
3. Verify only valid characters (alphanumeric)
4. Verify randomness (no duplicates in large sample)

**Expected Coverage**: Utility functions

#### Test Case 3.2.4: Error Response Formatting

**Objective**: Test error handler  
**Test Steps**:

1. Create CommonError with various error types
2. Verify JSON structure
3. Test NewError() function
4. Test NewValidatorError() function
5. Verify error message formatting

**Expected Coverage**: Error utilities

### 3.3 Validation (Priority: High)

#### Test Case 3.3.1: Input Validation

**Objective**: Test validation framework integration  
**Test Steps**:

1. Test required field validation
2. Test format validation (email, URL)
3. Test length validation (min, max)
4. Test custom validation rules
5. Verify error messages

**Expected Coverage**: Validation middleware

#### Test Case 3.3.2: Sanitization

**Objective**: Test input sanitization  
**Test Steps**:

1. Submit data with special characters
2. Verify SQL injection prevention
3. Verify XSS prevention
4. Test whitespace trimming

**Expected Coverage**: Security

### 3.4 CORS Configuration (Priority: Low)

#### Test Case 3.4.1: CORS Headers

**Objective**: Test cross-origin requests  
**Test Steps**:

1. Send OPTIONS request
2. Verify CORS headers present
3. Test allowed origins
4. Test allowed methods
5. Test allowed headers

**Expected Coverage**: CORS middleware

---

## Integration Test Scenarios (Cross-Module)

### Scenario 1: Complete User Journey

**Objective**: Test end-to-end user workflow  
**Steps**:

1. Register new user → Login → Get profile
2. Update profile → Verify changes
3. Follow another user → Verify relationship
4. Create article → Add tags → Post comment
5. Favorite own article → View feed
6. Update article → Delete article
7. Logout

**Expected Coverage**: All modules integration

### Scenario 2: Multi-User Interactions

**Objective**: Test collaborative features  
**Steps**:

1. Create users A, B, C
2. A creates article
3. B favorites and comments on A's article
4. C follows both A and B
5. C views feed with A's and B's articles
6. B creates article
7. A unfollows B
8. Verify A's feed only shows followed users' articles

**Expected Coverage**: Complex relationships

### Scenario 3: High-Load Simulation

**Objective**: Test concurrent operations  
**Steps**:

1. Create 100 users concurrently
2. Each user creates 5 articles
3. Random favorite/follow operations
4. Query feed and list endpoints
5. Verify data consistency

**Expected Coverage**: Concurrency, Performance

### Scenario 4: Error Recovery

**Objective**: Test system resilience  
**Steps**:

1. Attempt operations with invalid data
2. Test partial transaction rollback
3. Test constraint violations
4. Verify system remains stable
5. Verify no data corruption

**Expected Coverage**: Error handling, Transactions

---

## Test Coverage Strategy

### Coverage Goals

| Module   | Target Coverage | Priority |
| -------- | --------------- | -------- |
| Users    | 85%+            | High     |
| Articles | 85%+            | High     |
| Common   | 80%+            | High     |
| Overall  | 80%+            | Critical |

### Coverage Areas

#### 1. Code Coverage

- **Line Coverage**: 80%+ of all lines executed
- **Branch Coverage**: 75%+ of all branches tested
- **Function Coverage**: 90%+ of all functions called

#### 2. API Endpoint Coverage

- All public endpoints tested (100%)
- All HTTP methods tested
- All query parameters tested
- All error responses tested

#### 3. Database Coverage

- All models CRUD operations tested
- All relationships tested
- All constraints tested
- Transaction scenarios tested

#### 4. Business Logic Coverage

- Authentication/Authorization (100%)
- Follow system (100%)
- Favorite system (100%)
- Comment system (100%)
- Feed generation (100%)
- Tag management (100%)

### Coverage Measurement

#### Tools

```bash
# Run tests with coverage
go test ./... -coverprofile=coverage.out

# View coverage report
go tool cover -html=coverage.out

# Generate detailed coverage
go test ./... -coverprofile=coverage.out -covermode=count

# Check coverage percentage
go test ./... -cover
```

#### Coverage Reports

Generate coverage reports for each module:

```bash
# Users module
go test ./users -coverprofile=users_coverage.out

# Articles module
go test ./articles -coverprofile=articles_coverage.out

# Common module
go test ./common -coverprofile=common_coverage.out
```

---

## Test Implementation Guidelines

### Test File Structure

```
module/
├── models.go
├── routers.go
├── validators.go
├── serializers.go
├── unit_test.go          # Unit tests
└── integration_test.go    # Integration tests (NEW)
```

### Test Naming Convention

```go
func TestIntegration_ModuleName_Functionality(t *testing.T)
// Example:
func TestIntegration_Users_CompleteRegistrationFlow(t *testing.T)
func TestIntegration_Articles_CreateWithTags(t *testing.T)
```

### Test Setup Pattern

```go
func TestIntegration_Feature(t *testing.T) {
    // 1. Setup
    resetDBWithMock()
    router := setupRouter()

    // 2. Execute
    req, _ := http.NewRequest("POST", "/api/endpoint", body)
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // 3. Assert
    assert.Equal(t, http.StatusOK, w.Code)

    // 4. Verify database state
    // 5. Cleanup (if needed)
}
```

### Mock Data Management

```go
// Create reusable mock data generators
func createMockUser(username string) UserModel { }
func createMockArticle(author ArticleUserModel) ArticleModel { }
func createMockComment(article ArticleModel) CommentModel { }
```

### Test Isolation

- Each test should be independent
- Use transactions for test isolation
- Clean up test data after each test
- Reset database state between tests

---

## Test Execution Plan

### Phase 1: Foundation (Week 1)

- Setup test infrastructure
- Implement Common module integration tests
- Achieve 80% coverage on Common module

### Phase 2: Authentication (Week 2)

- Implement Users module integration tests
- Focus on auth and profile features
- Achieve 85% coverage on Users module

### Phase 3: Core Features (Week 3)

- Implement Articles module CRUD integration tests
- Test favorite and comment systems
- Achieve 80% coverage on Articles module

### Phase 4: Complex Scenarios (Week 4)

- Implement cross-module integration tests
- Test feed and tag systems
- Achieve 85% overall coverage

### Phase 5: Optimization (Week 5)

- Identify coverage gaps
- Add tests for edge cases
- Performance testing
- Achieve 80%+ overall coverage

### Continuous Testing

```bash
# Run all integration tests
go test ./... -v -tags=integration

# Run specific module
go test ./users -v -tags=integration

# Run with coverage
go test ./... -v -tags=integration -coverprofile=integration_coverage.out

# Watch mode (using tools like gowatch)
gowatch -run="go test ./... -v"
```

---

## Success Criteria

### Quantitative Metrics

- [ ] Overall test coverage ≥ 80%
- [ ] Users module coverage ≥ 85%
- [ ] Articles module coverage ≥ 85%
- [ ] Common module coverage ≥ 80%
- [ ] All API endpoints have integration tests
- [ ] All critical paths tested
- [ ] Zero failing tests in main branch

### Qualitative Metrics

- [ ] All business logic covered
- [ ] All error scenarios tested
- [ ] All security features validated
- [ ] All database relationships verified
- [ ] All edge cases documented and tested
- [ ] Tests are maintainable and readable
- [ ] Tests run in < 30 seconds

---

## Test Maintenance

### Regular Updates

- Update tests when adding new features
- Refactor tests when refactoring code
- Review test coverage monthly
- Remove obsolete tests

### Documentation

- Document complex test scenarios
- Maintain test data fixtures
- Update this test plan quarterly
- Keep coverage reports in repository

### Code Review

- Require tests for new features
- Review test quality in PRs
- Ensure tests follow conventions
- Verify coverage doesn't decrease

---

## Appendix

### A. Test Data Fixtures

```go
// Standard test users
var testUser1 = UserModel{Username: "testuser1", Email: "test1@example.com"}
var testUser2 = UserModel{Username: "testuser2", Email: "test2@example.com"}

// Standard test articles
var testArticle1 = ArticleModel{Title: "Test Article 1", ...}
```

### B. Common Test Utilities

```go
// Helper to create authenticated request
func AuthenticatedRequest(method, url string, body io.Reader, userID uint) *http.Request

// Helper to verify JSON response
func AssertJSONResponse(t *testing.T, expected, actual interface{})

// Helper to setup router with all routes
func SetupTestRouter() *gin.Engine
```

### C. Coverage Commands Reference

```bash
# Generate HTML coverage report
go test ./... -coverprofile=coverage.out && go tool cover -html=coverage.out

# Check specific package coverage
go test ./users -cover

# Detailed coverage with function breakdown
go test ./... -coverprofile=coverage.out -covermode=count
go tool cover -func=coverage.out

# Find uncovered code
go test ./... -coverprofile=coverage.out
grep -v -E "100.0%" coverage.out
```

### D. Integration Test Template

```go
package module_test

import (
    "testing"
    "net/http"
    "net/http/httptest"
    "github.com/stretchr/testify/assert"
)

func TestIntegration_Feature_Scenario(t *testing.T) {
    // Arrange
    resetDBWithMock()
    router := setupRouter()

    // Act
    req, _ := http.NewRequest("GET", "/api/endpoint", nil)
    w := httptest.NewRecorder()
    router.ServeHTTP(w, req)

    // Assert
    assert.Equal(t, http.StatusOK, w.Code)

    // Verify
    // Check database state
    // Validate response data
}
```

---

## Conclusion

This comprehensive integration test plan provides a roadmap to achieve 80%+ test coverage across all modules of the RealWorld Backend application. By following this plan systematically, we will ensure:

1. **Reliability**: All critical features are thoroughly tested
2. **Maintainability**: Tests serve as living documentation
3. **Confidence**: Refactoring can be done safely
4. **Quality**: Bugs are caught early in development
5. **Coverage**: All modules exceed the 80% coverage threshold

The phased approach allows for incremental progress while maintaining focus on high-priority features first. Regular coverage monitoring and test maintenance will ensure long-term test suite health.
