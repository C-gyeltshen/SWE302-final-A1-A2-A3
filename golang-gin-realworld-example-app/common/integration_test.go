package common

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

// TestIntegration_Common_DatabaseConnection tests database initialization
func TestIntegration_Common_DatabaseConnection(t *testing.T) {
	asserts := assert.New(t)
	
	// Test database initialization
	db := Init()
	asserts.NotNil(db, "Database should be initialized")
	
	// Verify database file created
	_, err := os.Stat("./../gorm.db")
	asserts.NoError(err, "Database file should exist")
	
	// Test connection
	asserts.NoError(db.DB().Ping(), "Database should be pingable")
	
	// Test GetDB
	connection := GetDB()
	asserts.NotNil(connection, "GetDB should return connection")
	asserts.NoError(connection.DB().Ping(), "Connection should be valid")
	
	db.Close()
}

// TestIntegration_Common_TestDatabaseLifecycle tests test database management
func TestIntegration_Common_TestDatabaseLifecycle(t *testing.T) {
	asserts := assert.New(t)
	
	// Initialize test database
	testDb := TestDBInit()
	asserts.NotNil(testDb, "Test database should be initialized")
	
	// Verify test database file created
	_, err := os.Stat("./../gorm_test.db")
	asserts.NoError(err, "Test database file should exist")
	
	// Test connection
	asserts.NoError(testDb.DB().Ping(), "Test database should be pingable")
	
	// Perform some operations
	type TestModel struct {
		ID   uint
		Name string
	}
	testDb.AutoMigrate(&TestModel{})
	testModel := TestModel{Name: "test"}
	testDb.Create(&testModel)
	
	var retrieved TestModel
	testDb.First(&retrieved, testModel.ID)
	asserts.Equal("test", retrieved.Name, "Should be able to perform operations")
	
	// Clean up
	err = TestDBFree(testDb)
	asserts.NoError(err, "Test database cleanup should succeed")
	
	// Verify test database removed
	_, err = os.Stat("./../gorm_test.db")
	asserts.Error(err, "Test database file should be removed")
}

// TestIntegration_Common_DatabaseConnectionPool tests connection management
func TestIntegration_Common_DatabaseConnectionPool(t *testing.T) {
	asserts := assert.New(t)
	
	// Initialize database
	db := TestDBInit()
	defer TestDBFree(db)
	
	// Set max idle connections
	db.DB().SetMaxIdleConns(5)
	db.DB().SetMaxOpenConns(10)
	
	// Perform multiple concurrent queries
	type TestModel struct {
		ID   uint
		Name string
	}
	db.AutoMigrate(&TestModel{})
	
	// Create test data
	for i := 0; i < 10; i++ {
		db.Create(&TestModel{Name: "test"})
	}
	
	// Concurrent queries
	done := make(chan bool)
	for i := 0; i < 5; i++ {
		go func() {
			var models []TestModel
			db.Find(&models)
			done <- true
		}()
	}
	
	// Wait for all goroutines
	for i := 0; i < 5; i++ {
		<-done
	}
	
	// Verify no connection leaks
	stats := db.DB().Stats()
	asserts.LessOrEqual(stats.OpenConnections, 10, "Should not exceed max connections")
}

// TestIntegration_Common_JWTTokenGeneration tests token creation
func TestIntegration_Common_JWTTokenGeneration(t *testing.T) {
	asserts := assert.New(t)
	
	// Generate token
	userID := uint(123)
	token := GenToken(userID)
	
	// Verify token format
	asserts.NotEmpty(token, "Token should not be empty")
	asserts.IsType("", token, "Token should be string")
	asserts.Greater(len(token), 50, "Token should have reasonable length")
	
	// Parse token to verify structure
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})
	
	asserts.NoError(err, "Token should be parsable")
	asserts.True(parsedToken.Valid, "Token should be valid")
	
	// Verify claims
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok {
		asserts.Equal(float64(userID), claims["id"], "Token should contain user ID")
		asserts.Contains(claims, "exp", "Token should contain expiration")
		
		// Verify expiration is approximately 24 hours from now
		exp := int64(claims["exp"].(float64))
		expectedExp := time.Now().Add(time.Hour * 24).Unix()
		asserts.InDelta(expectedExp, exp, 60, "Expiration should be ~24 hours")
	}
}

// TestIntegration_Common_JWTTokenValidation tests token verification
func TestIntegration_Common_JWTTokenValidation(t *testing.T) {
	asserts := assert.New(t)
	
	// Generate valid token
	userID := uint(456)
	validToken := GenToken(userID)
	
	// Parse and validate
	parsedToken, err := jwt.Parse(validToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})
	
	asserts.NoError(err, "Valid token should parse successfully")
	asserts.True(parsedToken.Valid, "Token should be valid")
	
	// Test expired token (create token with past expiration)
	expiredToken := jwt.New(jwt.GetSigningMethod("HS256"))
	expiredToken.Claims = jwt.MapClaims{
		"id":  userID,
		"exp": time.Now().Add(-time.Hour).Unix(), // Expired 1 hour ago
	}
	expiredTokenString, _ := expiredToken.SignedString([]byte(NBSecretPassword))
	
	parsedExpired, err := jwt.Parse(expiredTokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})
	
	asserts.Error(err, "Expired token should fail validation")
	asserts.False(parsedExpired.Valid, "Expired token should not be valid")
	
	// Test tampered token
	tamperedToken := validToken + "tampered"
	parsedTampered, err := jwt.Parse(tamperedToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})
	
	asserts.Error(err, "Tampered token should fail validation")
	asserts.False(parsedTampered.Valid, "Tampered token should not be valid")
	
	// Test invalid signature
	invalidSigToken := jwt.New(jwt.GetSigningMethod("HS256"))
	invalidSigToken.Claims = jwt.MapClaims{
		"id":  userID,
		"exp": time.Now().Add(time.Hour * 24).Unix(),
	}
	invalidSigTokenString, _ := invalidSigToken.SignedString([]byte("wrong-secret"))
	
	_, err = jwt.Parse(invalidSigTokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(NBSecretPassword), nil
	})
	
	asserts.Error(err, "Token with invalid signature should fail")
}

// TestIntegration_Common_RandomStringGeneration tests RandString utility
func TestIntegration_Common_RandomStringGeneration(t *testing.T) {
	asserts := assert.New(t)
	
	// Test various lengths
	testCases := []int{0, 10, 50, 100}
	
	for _, length := range testCases {
		str := RandString(length)
		asserts.Equal(length, len(str), "String should have correct length")
		
		// Verify only alphanumeric characters
		if length > 0 {
			for _, ch := range str {
				isValid := (ch >= 'a' && ch <= 'z') || 
						   (ch >= 'A' && ch <= 'Z') || 
						   (ch >= '0' && ch <= '9')
				asserts.True(isValid, "String should contain only alphanumeric characters")
			}
		}
	}
	
	// Test randomness - generate multiple strings and ensure they're different
	strings := make(map[string]bool)
	for i := 0; i < 100; i++ {
		str := RandString(20)
		strings[str] = true
	}
	
	asserts.Greater(len(strings), 95, "Generated strings should be mostly unique")
}

// TestIntegration_Common_ErrorResponseFormatting tests error handler
func TestIntegration_Common_ErrorResponseFormatting(t *testing.T) {
	asserts := assert.New(t)
	
	// Test NewError
	err := NewError("database", assert.AnError)
	asserts.NotNil(err, "NewError should return error object")
	asserts.Contains(err.Errors, "database", "Error should contain specified key")
	
	// Test with multiple error types
	errorTypes := []string{"validation", "authentication", "authorization", "not_found"}
	for _, errType := range errorTypes {
		commonErr := NewError(errType, assert.AnError)
		asserts.Contains(commonErr.Errors, errType, "Error should contain error type")
	}
}

// TestIntegration_Common_ErrorSerialization tests error JSON output
func TestIntegration_Common_ErrorSerialization(t *testing.T) {
	asserts := assert.New(t)
	
	// Create error
	commonErr := NewError("validation", assert.AnError)
	
	// Verify structure
	asserts.IsType(CommonError{}, commonErr, "Should be CommonError type")
	asserts.IsType(map[string]interface{}{}, commonErr.Errors, "Errors should be map")
	asserts.NotEmpty(commonErr.Errors, "Errors map should not be empty")
}

// TestIntegration_Common_ConcurrentDatabaseAccess tests concurrent operations
func TestIntegration_Common_ConcurrentDatabaseAccess(t *testing.T) {
	asserts := assert.New(t)
	
	// Initialize test database
	db := TestDBInit()
	defer TestDBFree(db)
	
	// Create test table
	type TestModel struct {
		ID   uint
		Name string
	}
	db.AutoMigrate(&TestModel{})
	
	// Concurrent writes
	done := make(chan bool)
	errors := make(chan error, 50)
	
	for i := 0; i < 50; i++ {
		go func(index int) {
			model := TestModel{Name: RandString(10)}
			err := db.Create(&model).Error
			if err != nil {
				errors <- err
			}
			done <- true
		}(i)
	}
	
	// Wait for all goroutines
	for i := 0; i < 50; i++ {
		<-done
	}
	close(errors)
	
	// Check for errors
	errorCount := 0
	for err := range errors {
		if err != nil {
			errorCount++
		}
	}
	
	asserts.Equal(0, errorCount, "Concurrent operations should not cause errors")
	
	// Verify all records were created
	var count int
	db.Model(&TestModel{}).Count(&count)
	asserts.Equal(50, count, "All records should be created")
}

// TestIntegration_Common_TransactionRollback tests transaction handling
func TestIntegration_Common_TransactionRollback(t *testing.T) {
	asserts := assert.New(t)
	
	// Initialize test database
	db := TestDBInit()
	defer TestDBFree(db)
	
	// Create test table
	type TestModel struct {
		ID   uint
		Name string
	}
	db.AutoMigrate(&TestModel{})
	
	// Start transaction
	tx := db.Begin()
	
	// Create record in transaction
	model := TestModel{Name: "test"}
	tx.Create(&model)
	
	// Verify record exists in transaction
	var found TestModel
	tx.First(&found, model.ID)
	asserts.Equal("test", found.Name)
	
	// Rollback
	tx.Rollback()
	
	// Verify record doesn't exist after rollback
	var notFound TestModel
	err := db.First(&notFound, model.ID).Error
	asserts.Error(err, "Record should not exist after rollback")
}

// TestIntegration_Common_TransactionCommit tests transaction commit
func TestIntegration_Common_TransactionCommit(t *testing.T) {
	asserts := assert.New(t)
	
	// Initialize test database
	db := TestDBInit()
	defer TestDBFree(db)
	
	// Create test table
	type TestModel struct {
		ID   uint
		Name string
	}
	db.AutoMigrate(&TestModel{})
	
	// Start transaction
	tx := db.Begin()
	
	// Create multiple records in transaction
	for i := 0; i < 5; i++ {
		model := TestModel{Name: RandString(10)}
		tx.Create(&model)
	}
	
	// Commit
	tx.Commit()
	
	// Verify all records exist after commit
	var count int
	db.Model(&TestModel{}).Count(&count)
	asserts.Equal(5, count, "All records should exist after commit")
}

// TestIntegration_Common_DatabaseMigration tests auto-migration
func TestIntegration_Common_DatabaseMigration(t *testing.T) {
	asserts := assert.New(t)
	
	// Initialize test database
	db := TestDBInit()
	defer TestDBFree(db)
	
	// Define test models with relationships
	type Child struct {
		ID       uint
		Name     string
		ParentID uint
	}
	
	type Parent struct {
		ID       uint
		Name     string
		Children []Child
	}
	
	// Run migrations
	err := db.AutoMigrate(&Parent{}, &Child{}).Error
	asserts.NoError(err, "AutoMigrate should succeed")
	
	// Verify tables exist
	asserts.True(db.HasTable(&Parent{}), "Parent table should exist")
	asserts.True(db.HasTable(&Child{}), "Child table should exist")
	
	// Test relationship
	parent := Parent{Name: "Parent1"}
	db.Create(&parent)
	
	child := Child{Name: "Child1", ParentID: parent.ID}
	db.Create(&child)
	
	// Verify relationship works
	var retrievedParent Parent
	db.Preload("Children").First(&retrievedParent, parent.ID)
	asserts.Equal(1, len(retrievedParent.Children), "Relationship should work")
}
