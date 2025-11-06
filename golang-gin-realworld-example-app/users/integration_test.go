package users

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"realworld-backend/common"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// setupRouter creates a test router with all routes configured
func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	
	v1 := r.Group("/api")
	UsersRegister(v1.Group("/users"))
	v1.Use(AuthMiddleware(false))
	ProfileRegister(v1.Group("/profiles"))
	
	v1Auth := r.Group("/api")
	v1Auth.Use(AuthMiddleware(true))
	UserRegister(v1Auth.Group("/user"))
	
	return r
}

// TestIntegration_Users_CompleteRegistrationFlow tests the end-to-end user registration
func TestIntegration_Users_CompleteRegistrationFlow(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Prepare request body
	requestBody := map[string]interface{}{
		"user": map[string]interface{}{
			"username": "testuser",
			"email":    "test@example.com",
			"password": "password123",
		},
	}
	jsonBody, _ := json.Marshal(requestBody)
	
	// Execute
	req, _ := http.NewRequest("POST", "/api/users/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert HTTP response
	asserts.Equal(http.StatusCreated, w.Code, "Should return 201 Created")
	
	// Parse response
	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	asserts.NoError(err, "Response should be valid JSON")
	
	// Verify response structure
	asserts.Contains(response, "user", "Response should contain user object")
	user := response["user"].(map[string]interface{})
	asserts.Equal("testuser", user["username"])
	asserts.Equal("test@example.com", user["email"])
	asserts.Contains(user, "token", "Response should contain JWT token")
	asserts.NotEmpty(user["token"], "Token should not be empty")
	
	// Verify database
	userModel, err := FindOneUser(&UserModel{Email: "test@example.com"})
	asserts.NoError(err, "User should exist in database")
	asserts.Equal("testuser", userModel.Username)
	asserts.NotEmpty(userModel.PasswordHash, "Password should be hashed")
	asserts.NotEqual("password123", userModel.PasswordHash, "Password should not be stored as plain text")
}

// TestIntegration_Users_RegistrationWithDuplicateEmail tests duplicate email validation
func TestIntegration_Users_RegistrationWithDuplicateEmail(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create first user
	userModelMocker(1)
	
	// Try to create user with duplicate email
	requestBody := map[string]interface{}{
		"user": map[string]interface{}{
			"username": "newuser",
			"email":    "user1@linkedin.com", // Duplicate email
			"password": "password123",
		},
	}
	jsonBody, _ := json.Marshal(requestBody)
	
	req, _ := http.NewRequest("POST", "/api/users/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusUnprocessableEntity, w.Code, "Should return 422 for duplicate email")
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "errors", "Response should contain errors")
}

// TestIntegration_Users_RegistrationWithInvalidData tests input validation
func TestIntegration_Users_RegistrationWithInvalidData(t *testing.T) {
	asserts := assert.New(t)
	
	resetDBWithMock()
	router := setupRouter()
	
	testCases := []struct {
		name     string
		body     map[string]interface{}
		expected int
	}{
		{
			name: "Missing username",
			body: map[string]interface{}{
				"user": map[string]interface{}{
					"email":    "test@example.com",
					"password": "password123",
				},
			},
			expected: http.StatusUnprocessableEntity,
		},
		{
			name: "Missing email",
			body: map[string]interface{}{
				"user": map[string]interface{}{
					"username": "testuser",
					"password": "password123",
				},
			},
			expected: http.StatusUnprocessableEntity,
		},
		{
			name: "Missing password",
			body: map[string]interface{}{
				"user": map[string]interface{}{
					"username": "testuser",
					"email":    "test@example.com",
				},
			},
			expected: http.StatusUnprocessableEntity,
		},
	}
	
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			jsonBody, _ := json.Marshal(tc.body)
			req, _ := http.NewRequest("POST", "/api/users/", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			asserts.Equal(tc.expected, w.Code, tc.name)
		})
	}
}

// TestIntegration_Users_LoginFlow tests complete login authentication
func TestIntegration_Users_LoginFlow(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create a user first
	users := userModelMocker(1)
	user := users[0]
	
	// Login request
	loginBody := map[string]interface{}{
		"user": map[string]interface{}{
			"email":    user.Email,
			"password": "password123",
		},
	}
	jsonBody, _ := json.Marshal(loginBody)
	
	req, _ := http.NewRequest("POST", "/api/users/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code, "Should return 200 OK")
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "user")
	userResp := response["user"].(map[string]interface{})
	asserts.Contains(userResp, "token")
	asserts.NotEmpty(userResp["token"], "Token should be generated")
	
	// Verify token can be used for authenticated request
	token := userResp["token"].(string)
	req2, _ := http.NewRequest("GET", "/api/user/", nil)
	req2.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	
	asserts.Equal(http.StatusOK, w2.Code, "Token should work for authenticated requests")
}

// TestIntegration_Users_LoginWithInvalidCredentials tests authentication failure
func TestIntegration_Users_LoginWithInvalidCredentials(t *testing.T) {
	asserts := assert.New(t)
	
	resetDBWithMock()
	router := setupRouter()
	
	testCases := []struct {
		name     string
		email    string
		password string
	}{
		{"Non-existent email", "nonexistent@example.com", "password123"},
		{"Incorrect password", "user1@linkedin.com", "wrongpassword"},
	}
	
	// Create a user
	userModelMocker(1)
	
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			loginBody := map[string]interface{}{
				"user": map[string]interface{}{
					"email":    tc.email,
					"password": tc.password,
				},
			}
			jsonBody, _ := json.Marshal(loginBody)
			
			req, _ := http.NewRequest("POST", "/api/users/login", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			asserts.Equal(http.StatusForbidden, w.Code, tc.name)
		})
	}
}

// TestIntegration_Users_RetrieveCurrentUser tests authenticated user retrieval
func TestIntegration_Users_RetrieveCurrentUser(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create user
	users := userModelMocker(1)
	user := users[0]
	token := common.GenToken(user.ID)
	
	// Execute
	req, _ := http.NewRequest("GET", "/api/user/", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "user")
	userResp := response["user"].(map[string]interface{})
	asserts.Equal(user.Email, userResp["email"])
	asserts.Equal(user.Username, userResp["username"])
}

// TestIntegration_Users_UpdateUserProfile tests profile update functionality
func TestIntegration_Users_UpdateUserProfile(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create user
	users := userModelMocker(1)
	user := users[0]
	token := common.GenToken(user.ID)
	
	// Update request
	updateBody := map[string]interface{}{
		"user": map[string]interface{}{
			"username": "updateduser",
			"bio":      "Updated bio",
			"email":    "updated@example.com",
		},
	}
	jsonBody, _ := json.Marshal(updateBody)
	
	req, _ := http.NewRequest("PUT", "/api/user/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	// Verify database
	updatedUser, _ := FindOneUser(&UserModel{ID: user.ID})
	asserts.Equal("updateduser", updatedUser.Username)
	asserts.Equal("Updated bio", updatedUser.Bio)
	asserts.Equal("updated@example.com", updatedUser.Email)
}

// TestIntegration_Users_UpdateWithoutAuthentication tests authorization protection
func TestIntegration_Users_UpdateWithoutAuthentication(t *testing.T) {
	asserts := assert.New(t)
	
	resetDBWithMock()
	router := setupRouter()
	
	updateBody := map[string]interface{}{
		"user": map[string]interface{}{
			"username": "updateduser",
		},
	}
	jsonBody, _ := json.Marshal(updateBody)
	
	req, _ := http.NewRequest("PUT", "/api/user/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	asserts.Equal(http.StatusUnauthorized, w.Code, "Should require authentication")
}

// TestIntegration_Users_RetrieveProfile tests public profile retrieval
func TestIntegration_Users_RetrieveProfile(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create user
	users := userModelMocker(1)
	user := users[0]
	
	// Execute
	req, _ := http.NewRequest("GET", fmt.Sprintf("/api/profiles/%s", user.Username), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "profile")
	profile := response["profile"].(map[string]interface{})
	asserts.Equal(user.Username, profile["username"])
	asserts.Equal(user.Bio, profile["bio"])
}

// TestIntegration_Users_FollowUser tests follow functionality
func TestIntegration_Users_FollowUser(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create two users
	users := userModelMocker(2)
	userA := users[0]
	userB := users[1]
	tokenA := common.GenToken(userA.ID)
	
	// User A follows User B
	req, _ := http.NewRequest("POST", fmt.Sprintf("/api/profiles/%s/follow", userB.Username), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", tokenA))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	profile := response["profile"].(map[string]interface{})
	asserts.Equal(true, profile["following"], "Should show following: true")
	
	// Verify in database
	asserts.True(userA.isFollowing(userB), "Following relationship should exist in database")
}

// TestIntegration_Users_UnfollowUser tests unfollow functionality
func TestIntegration_Users_UnfollowUser(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create two users
	users := userModelMocker(2)
	userA := users[0]
	userB := users[1]
	
	// Create follow relationship
	userA.following(userB)
	tokenA := common.GenToken(userA.ID)
	
	// User A unfollows User B
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/profiles/%s/follow", userB.Username), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", tokenA))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	profile := response["profile"].(map[string]interface{})
	asserts.Equal(false, profile["following"], "Should show following: false")
	
	// Verify in database
	asserts.False(userA.isFollowing(userB), "Following relationship should be removed")
}

// TestIntegration_Users_FollowNonexistentUser tests error handling
func TestIntegration_Users_FollowNonexistentUser(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create user
	users := userModelMocker(1)
	user := users[0]
	token := common.GenToken(user.ID)
	
	// Try to follow non-existent user
	req, _ := http.NewRequest("POST", "/api/profiles/nonexistent/follow", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusNotFound, w.Code, "Should return 404 for non-existent user")
}

// TestIntegration_Users_MultipleFollowRelationships tests complex follow scenarios
func TestIntegration_Users_MultipleFollowRelationships(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	
	// Create users A, B, C, D
	users := userModelMocker(4)
	userA := users[0]
	userB := users[1]
	userC := users[2]
	userD := users[3]
	
	// A follows B, C, D
	userA.following(userB)
	userA.following(userC)
	userA.following(userD)
	
	// Verify
	followings := userA.GetFollowings()
	asserts.Equal(3, len(followings), "A should be following 3 users")
	
	// B follows A (mutual following)
	userB.following(userA)
	asserts.True(userA.isFollowing(userB), "A should be following B")
	asserts.True(userB.isFollowing(userA), "B should be following A")
}

// TestIntegration_Users_ValidJWTTokenAuthentication tests middleware with valid token
func TestIntegration_Users_ValidJWTTokenAuthentication(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupRouter()
	
	// Create user
	users := userModelMocker(1)
	user := users[0]
	token := common.GenToken(user.ID)
	
	// Make authenticated request
	req, _ := http.NewRequest("GET", "/api/user/", nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code, "Valid token should allow access")
}

// TestIntegration_Users_InvalidJWTToken tests token validation
func TestIntegration_Users_InvalidJWTToken(t *testing.T) {
	asserts := assert.New(t)
	
	resetDBWithMock()
	router := setupRouter()
	
	testCases := []struct {
		name  string
		token string
	}{
		{"Malformed token", "invalid.token.here"},
		{"Empty token", ""},
		{"Random string", "randomstring123"},
	}
	
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/api/user/", nil)
			if tc.token != "" {
				req.Header.Set("Authorization", fmt.Sprintf("Token %s", tc.token))
			}
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)
			
			asserts.Equal(http.StatusUnauthorized, w.Code, tc.name)
		})
	}
}
