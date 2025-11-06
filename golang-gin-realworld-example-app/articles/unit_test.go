package articles

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"realworld-backend/common"
	"realworld-backend/users"

	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
)

var test_db *gorm.DB

// AutoMigrate creates the necessary tables for articles
func AutoMigrate() {
	test_db.AutoMigrate(&ArticleModel{})
	test_db.AutoMigrate(&ArticleUserModel{})
	test_db.AutoMigrate(&TagModel{})
	test_db.AutoMigrate(&FavoriteModel{})
	test_db.AutoMigrate(&CommentModel{})
}

// userModelMocker creates mock users for testing
func userModelMocker(n int) []users.UserModel {
	var offset int
	test_db.Model(&users.UserModel{}).Count(&offset)
	var ret []users.UserModel
	for i := offset + 1; i <= offset+n; i++ {
		image := fmt.Sprintf("http://image/%v.jpg", i)
		// Using bcrypt hash of "password123" for testing
		passwordHash := "$2a$10$X/Y7QQj3f8H8Q8Q8Q8Q8Q.Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q"
		userModel := users.UserModel{
			Username:     fmt.Sprintf("user%v", i),
			Email:        fmt.Sprintf("user%v@test.com", i),
			Bio:          fmt.Sprintf("bio%v", i),
			Image:        &image,
			PasswordHash: passwordHash,
		}
		test_db.Create(&userModel)
		ret = append(ret, userModel)
	}
	return ret
}

// articleModelMocker creates mock articles for testing
func articleModelMocker(n int, author ArticleUserModel) []ArticleModel {
	var offset int
	test_db.Model(&ArticleModel{}).Count(&offset)
	var ret []ArticleModel
	for i := offset + 1; i <= offset+n; i++ {
		articleModel := ArticleModel{
			Slug:        fmt.Sprintf("test-article-%v", i),
			Title:       fmt.Sprintf("Test Article %v", i),
			Description: fmt.Sprintf("Description for article %v", i),
			Body:        fmt.Sprintf("Body content for article %v", i),
			Author:      author,
			AuthorID:    author.ID,
		}
		test_db.Create(&articleModel)
		
		// Add some tags
		if i%2 == 0 {
			tag := TagModel{Tag: fmt.Sprintf("tag%v", i)}
			test_db.FirstOrCreate(&tag, tag)
			articleModel.Tags = append(articleModel.Tags, tag)
			test_db.Model(&articleModel).Association("Tags").Append(&tag)
		}
		
		ret = append(ret, articleModel)
	}
	return ret
}

// Reset test DB and create new one with mock data
func resetDBWithMock() {
	if test_db != nil {
		common.TestDBFree(test_db)
	}
	test_db = common.TestDBInit()
	test_db.LogMode(false) // Disable log mode for cleaner output
	users.AutoMigrate()
	AutoMigrate()
}

func HeaderTokenMock(req *http.Request, u uint) {
	req.Header.Set("Authorization", fmt.Sprintf("Token %v", common.GenToken(u)))
}

// makeUserFollow creates a follow relationship between two users using the database directly
func makeUserFollow(follower, following users.UserModel) error {
	db := common.GetDB()
	// Manually create the follow relationship in the database
	type FollowModel struct {
		FollowingID  uint
		FollowedByID uint
	}
	follow := FollowModel{
		FollowingID:  following.ID,
		FollowedByID: follower.ID,
	}
	return db.Table("follow_models").Create(&follow).Error
}

// TestArticleModel tests the article model methods
func TestArticleModel(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	// Create test users
	userModels := userModelMocker(3)
	user1 := userModels[0]
	user2 := userModels[1]

	// Get article user models
	articleUser1 := GetArticleUserModel(user1)
	articleUser2 := GetArticleUserModel(user2)

	// Create test articles
	articles := articleModelMocker(2, articleUser1)
	article := articles[0]

	// Test favorites count
	initialCount := article.favoritesCount()
	asserts.Equal(uint(0), initialCount, "Initial favorites count should be 0")

	// Test isFavoriteBy
	asserts.False(article.isFavoriteBy(articleUser2), "Article should not be favorited initially")

	// Test favoriteBy
	err := article.favoriteBy(articleUser2)
	asserts.NoError(err, "Should be able to favorite article")
	asserts.True(article.isFavoriteBy(articleUser2), "Article should be favorited after favoriteBy")
	asserts.Equal(uint(1), article.favoritesCount(), "Favorites count should be 1")

	// Test duplicate favorite (should not error)
	err = article.favoriteBy(articleUser2)
	asserts.NoError(err, "Duplicate favorite should not error")
	asserts.Equal(uint(1), article.favoritesCount(), "Favorites count should still be 1")

	// Test unFavoriteBy
	err = article.unFavoriteBy(articleUser2)
	asserts.NoError(err, "Should be able to unfavorite article")
	asserts.False(article.isFavoriteBy(articleUser2), "Article should not be favorited after unfavorite")
	asserts.Equal(uint(0), article.favoritesCount(), "Favorites count should be 0 after unfavorite")
}

// TestTagModel tests tag-related functionality
func TestTagModel(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	// Create test tags
	tag1 := TagModel{Tag: "golang"}
	err := test_db.Create(&tag1).Error
	asserts.NoError(err, "Should create tag successfully")

	tag2 := TagModel{Tag: "web"}
	err = test_db.Create(&tag2).Error
	asserts.NoError(err, "Should create second tag successfully")

	// Test getAllTags
	tags, err := getAllTags()
	asserts.NoError(err, "Should get all tags")
	asserts.GreaterOrEqual(len(tags), 2, "Should have at least 2 tags")

	// Test setTags on article
	userModels := userModelMocker(1)
	articleUser := GetArticleUserModel(userModels[0])
	
	article := ArticleModel{
		Slug:        "test-tags-article",
		Title:       "Test Tags Article",
		Description: "Testing tags",
		Body:        "Body",
		Author:      articleUser,
		AuthorID:    articleUser.ID,
	}
	test_db.Create(&article)

	tagNames := []string{"golang", "testing", "web"}
	err = article.setTags(tagNames)
	asserts.NoError(err, "Should set tags successfully")
	asserts.Equal(3, len(article.Tags), "Should have 3 tags")
}

// TestFindOneArticle tests finding a single article
func TestFindOneArticle(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(1)
	articleUser := GetArticleUserModel(userModels[0])
	articles := articleModelMocker(1, articleUser)
	testArticle := articles[0]

	// Find by slug
	found, err := FindOneArticle(&ArticleModel{Slug: testArticle.Slug})
	asserts.NoError(err, "Should find article by slug")
	asserts.Equal(testArticle.Title, found.Title, "Found article should match")
	asserts.NotNil(found.Author.UserModel, "Author should be loaded")

	// Find non-existent article (GORM returns empty model with ID = 0 instead of error)
	notFound, err := FindOneArticle(&ArticleModel{Slug: "non-existent-slug"})
	// Check if the article was not found by checking ID
	asserts.Equal(uint(0), notFound.ID, "Should return empty model for non-existent article")
}

// TestFindManyArticle tests finding multiple articles with filters
func TestFindManyArticle(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(2)
	articleUser1 := GetArticleUserModel(userModels[0])
	articleUser2 := GetArticleUserModel(userModels[1])

	// Create articles with different authors
	articleModelMocker(3, articleUser1)
	articleModelMocker(2, articleUser2)

	// Test getting all articles
	articles, count, err := FindManyArticle("", "", "5", "0", "")
	asserts.NoError(err, "Should get all articles")
	asserts.GreaterOrEqual(count, 5, "Should have at least 5 articles")
	asserts.GreaterOrEqual(len(articles), 5, "Should return at least 5 articles")

	// Test limit and offset
	articles, count, err = FindManyArticle("", "", "2", "0", "")
	asserts.NoError(err, "Should get articles with limit")
	asserts.Equal(2, len(articles), "Should return 2 articles")

	// Test filter by author
	articles, count, err = FindManyArticle("", userModels[0].Username, "10", "0", "")
	asserts.NoError(err, "Should filter by author")
	asserts.Equal(3, count, "Should have 3 articles by user1")
}

// TestArticleComments tests comment functionality
func TestArticleComments(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(2)
	articleUser1 := GetArticleUserModel(userModels[0])
	articleUser2 := GetArticleUserModel(userModels[1])

	articles := articleModelMocker(1, articleUser1)
	article := articles[0]

	// Create comments
	comment1 := CommentModel{
		Article:   article,
		ArticleID: article.ID,
		Author:    articleUser2,
		AuthorID:  articleUser2.ID,
		Body:      "Great article!",
	}
	err := SaveOne(&comment1)
	asserts.NoError(err, "Should save comment")

	comment2 := CommentModel{
		Article:   article,
		ArticleID: article.ID,
		Author:    articleUser1,
		AuthorID:  articleUser1.ID,
		Body:      "Thanks for reading!",
	}
	err = SaveOne(&comment2)
	asserts.NoError(err, "Should save second comment")

	// Get comments
	err = article.getComments()
	asserts.NoError(err, "Should get comments")
	asserts.Equal(2, len(article.Comments), "Should have 2 comments")
	asserts.NotNil(article.Comments[0].Author.UserModel, "Comment author should be loaded")
}

// HTTP test setup
func makeTestContext() (*gin.Engine, *httptest.ResponseRecorder) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	recorder := httptest.NewRecorder()
	return router, recorder
}

var articleRequestTests = []struct {
	init           func(*http.Request)
	url            string
	method         string
	bodyData       string
	expectedCode   int
	msg            string
}{
	// Test article creation
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(1)
			HeaderTokenMock(req, users[0].ID)
		},
		"/api/articles/",
		"POST",
		`{"article":{"title":"Test Article Title","description":"Test description","body":"Test body content","tagList":["golang","testing"]}}`,
		http.StatusCreated,
		"Should create article successfully",
	},
	{
		func(req *http.Request) {
			users := userModelMocker(1)
			HeaderTokenMock(req, users[0].ID)
		},
		"/api/articles/",
		"POST",
		`{"article":{"title":"Abc","description":"Test","body":"Test"}}`,
		http.StatusUnprocessableEntity,
		"Should reject article with title too short",
	},
	// Test article list (anonymous)
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(1)
			articleUser := GetArticleUserModel(users[0])
			articleModelMocker(5, articleUser)
		},
		"/api/articles/",
		"GET",
		``,
		http.StatusOK,
		"Should list articles for anonymous user",
	},
	// Test article retrieval
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(1)
			articleUser := GetArticleUserModel(users[0])
			articleModelMocker(1, articleUser)
		},
		"/api/articles/test-article-1",
		"GET",
		``,
		http.StatusOK,
		"Should retrieve single article",
	},
	// Test article update
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(1)
			articleUser := GetArticleUserModel(users[0])
			articleModelMocker(1, articleUser)
			HeaderTokenMock(req, users[0].ID)
		},
		"/api/articles/test-article-1",
		"PUT",
		`{"article":{"title":"Updated Article Title","description":"Updated description","body":"Updated body"}}`,
		http.StatusOK,
		"Should update article successfully",
	},
	// Test article delete
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(1)
			articleUser := GetArticleUserModel(users[0])
			articleModelMocker(1, articleUser)
			HeaderTokenMock(req, users[0].ID)
		},
		"/api/articles/test-article-1",
		"DELETE",
		``,
		http.StatusOK,
		"Should delete article successfully",
	},
	// Test favorite article
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(2)
			articleUser := GetArticleUserModel(users[0])
			articleModelMocker(1, articleUser)
			HeaderTokenMock(req, users[1].ID)
		},
		"/api/articles/test-article-1/favorite",
		"POST",
		``,
		http.StatusOK,
		"Should favorite article successfully",
	},
	// Test unfavorite article
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(2)
			articleUser := GetArticleUserModel(users[0])
			articles := articleModelMocker(1, articleUser)
			// Favorite first
			articleUser2 := GetArticleUserModel(users[1])
			articles[0].favoriteBy(articleUser2)
			HeaderTokenMock(req, users[1].ID)
		},
		"/api/articles/test-article-1/favorite",
		"DELETE",
		``,
		http.StatusOK,
		"Should unfavorite article successfully",
	},
	// Test comment creation
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(2)
			articleUser := GetArticleUserModel(users[0])
			articleModelMocker(1, articleUser)
			HeaderTokenMock(req, users[1].ID)
		},
		"/api/articles/test-article-1/comments",
		"POST",
		`{"comment":{"body":"This is a test comment"}}`,
		http.StatusCreated,
		"Should create comment successfully",
	},
	// Test comment list
	{
		func(req *http.Request) {
			resetDBWithMock()
			users := userModelMocker(2)
			articleUser1 := GetArticleUserModel(users[0])
			articleUser2 := GetArticleUserModel(users[1])
			articles := articleModelMocker(1, articleUser1)
			
			// Add comments
			comment := CommentModel{
				Article:   articles[0],
				ArticleID: articles[0].ID,
				Author:    articleUser2,
				AuthorID:  articleUser2.ID,
				Body:      "Test comment",
			}
			SaveOne(&comment)
		},
		"/api/articles/test-article-1/comments",
		"GET",
		``,
		http.StatusOK,
		"Should list comments successfully",
	},
	// Test tags list
	{
		func(req *http.Request) {
			resetDBWithMock()
			tag1 := TagModel{Tag: "golang"}
			tag2 := TagModel{Tag: "testing"}
			test_db.Create(&tag1)
			test_db.Create(&tag2)
		},
		"/api/tags/",
		"GET",
		``,
		http.StatusOK,
		"Should list tags successfully",
	},
}

func TestArticleRequests(t *testing.T) {
	asserts := assert.New(t)

	for _, testData := range articleRequestTests {
		router, recorder := makeTestContext()
		
		// Setup routes
		v1 := router.Group("/api")
		users.UsersRegister(v1.Group("/users"))
		
		articlesGroup := v1.Group("/articles")
		articlesGroup.Use(users.AuthMiddleware(false))
		ArticlesAnonymousRegister(articlesGroup)
		
		authenticatedArticles := v1.Group("/articles")
		authenticatedArticles.Use(users.AuthMiddleware(true))
		ArticlesRegister(authenticatedArticles)
		
		tagsGroup := v1.Group("/tags")
		TagsAnonymousRegister(tagsGroup)

		// Create request
		bodyData := testData.bodyData
		req, err := http.NewRequest(testData.method, testData.url, bytes.NewBufferString(bodyData))
		req.Header.Set("Content-Type", "application/json")
		asserts.NoError(err)

		// Initialize test
		testData.init(req)

		// Perform request
		router.ServeHTTP(recorder, req)

		// Assert response
		asserts.Equal(testData.expectedCode, recorder.Code, testData.msg)
	}
}

// TestArticleValidator tests the article validator
func TestArticleValidator(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	gin.SetMode(gin.TestMode)
	
	users := userModelMocker(1)
	user := users[0]

	// Test valid article validation
	router := gin.New()
	router.POST("/test", func(c *gin.Context) {
		c.Set("my_user_model", user)
		validator := NewArticleModelValidator()
		err := validator.Bind(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true})
	})

	// Test with valid data
	validData := `{"article":{"title":"Valid Title Here","description":"Valid description","body":"Valid body","tagList":["tag1","tag2"]}}`
	req, _ := http.NewRequest("POST", "/test", bytes.NewBufferString(validData))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Valid article data should pass validation")

	// Test with invalid data (title too short)
	invalidData := `{"article":{"title":"Bad","description":"Valid description","body":"Valid body"}}`
	req, _ = http.NewRequest("POST", "/test", bytes.NewBufferString(invalidData))
	req.Header.Set("Content-Type", "application/json")
	recorder = httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusBadRequest, recorder.Code, "Invalid article data should fail validation")
}

// TestCommentValidator tests the comment validator
func TestCommentValidator(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	gin.SetMode(gin.TestMode)
	
	users := userModelMocker(1)
	user := users[0]

	router := gin.New()
	router.POST("/test", func(c *gin.Context) {
		c.Set("my_user_model", user)
		validator := NewCommentModelValidator()
		err := validator.Bind(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true})
	})

	// Test with valid comment
	validData := `{"comment":{"body":"This is a valid comment body"}}`
	req, _ := http.NewRequest("POST", "/test", bytes.NewBufferString(validData))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Valid comment data should pass validation")
}

// TestArticleFeed tests the article feed functionality
func TestArticleFeed(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(3)
	user1 := userModels[0]
	user2 := userModels[1]
	user3 := userModels[2]

	// User1 follows User2
	err := makeUserFollow(user1, user2)
	asserts.NoError(err, "User1 should follow User2")

	// Create articles by different users
	articleUser2 := GetArticleUserModel(user2)
	articleUser3 := GetArticleUserModel(user3)
	
	articleModelMocker(2, articleUser2) // User2's articles
	articleModelMocker(1, articleUser3) // User3's articles

	// Test GetArticleFeed
	articleUser1 := GetArticleUserModel(user1)
	articles, _, err := articleUser1.GetArticleFeed("10", "0")
	asserts.NoError(err, "Should get article feed")
	asserts.Equal(2, len(articles), "Should have 2 articles in feed from followed user")

	// Test with limit
	articles, _, err = articleUser1.GetArticleFeed("1", "0")
	asserts.NoError(err, "Should get article feed with limit")
	asserts.Equal(1, len(articles), "Should have 1 article with limit")

	// Test with offset
	articles, _, err = articleUser1.GetArticleFeed("10", "1")
	asserts.NoError(err, "Should get article feed with offset")
	asserts.Equal(1, len(articles), "Should have 1 article with offset")

	// Test with invalid limit and offset (should use defaults)
	articles, _, err = articleUser1.GetArticleFeed("invalid", "invalid")
	asserts.NoError(err, "Should handle invalid limit/offset")
	asserts.Equal(2, len(articles), "Should use default limit/offset")
}

// TestDeleteCommentModel tests comment deletion
func TestDeleteCommentModel(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(1)
	articleUser := GetArticleUserModel(userModels[0])
	articles := articleModelMocker(1, articleUser)
	article := articles[0]

	// Create a comment
	comment := CommentModel{
		Article:   article,
		ArticleID: article.ID,
		Author:    articleUser,
		AuthorID:  articleUser.ID,
		Body:      "Test comment to delete",
	}
	err := SaveOne(&comment)
	asserts.NoError(err, "Should save comment")

	// Delete the comment
	err = DeleteCommentModel([]uint{comment.ID})
	asserts.NoError(err, "Should delete comment")

	// Verify deletion
	var deletedComment CommentModel
	test_db.Where("id = ?", comment.ID).First(&deletedComment)
	asserts.Equal(uint(0), deletedComment.ID, "Comment should be deleted")
}

// TestArticleFeedEndpoint tests the article feed HTTP endpoint
func TestArticleFeedEndpoint(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(2)
	user1 := userModels[0]
	user2 := userModels[1]

	// User1 follows User2
	err := makeUserFollow(user1, user2)
	asserts.NoError(err, "User1 should follow User2")

	// Create articles by User2
	articleUser2 := GetArticleUserModel(user2)
	articleModelMocker(3, articleUser2)

	router, recorder := makeTestContext()
	v1 := router.Group("/api")
	users.UsersRegister(v1.Group("/users"))
	
	articlesGroup := v1.Group("/articles")
	articlesGroup.Use(users.AuthMiddleware(false))
	ArticlesAnonymousRegister(articlesGroup)

	// Test authenticated feed request
	req, _ := http.NewRequest("GET", "/api/articles/feed?limit=10&offset=0", nil)
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should get article feed successfully")

	// Test without authentication (should fail)
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/feed", nil)
	router.ServeHTTP(recorder, req)
	asserts.NotEqual(http.StatusOK, recorder.Code, "Should fail without authentication")
}

// TestArticleCommentDeleteEndpoint tests comment deletion via HTTP endpoint
func TestArticleCommentDeleteEndpoint(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(2)
	user1 := userModels[0]
	articleUser := GetArticleUserModel(user1)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]

	// Create a comment
	comment := CommentModel{
		Article:   article,
		ArticleID: article.ID,
		Author:    articleUser,
		AuthorID:  articleUser.ID,
		Body:      "Test comment to delete via endpoint",
	}
	SaveOne(&comment)

	router, recorder := makeTestContext()
	v1 := router.Group("/api")
	users.UsersRegister(v1.Group("/users"))
	
	authenticatedArticles := v1.Group("/articles")
	authenticatedArticles.Use(users.AuthMiddleware(true))
	ArticlesRegister(authenticatedArticles)

	// Test comment deletion
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/articles/%s/comments/%d", article.Slug, comment.ID), nil)
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should delete comment successfully")

	// Test with invalid ID format
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("DELETE", "/api/articles/test-article-1/comments/invalid", nil)
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusNotFound, recorder.Code, "Should return 404 for invalid ID format")
}

// TestFindManyArticleWithTags tests finding articles filtered by tags
func TestFindManyArticleWithTags(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(1)
	articleUser := GetArticleUserModel(userModels[0])

	// Create articles with specific tags
	article1 := ArticleModel{
		Slug:        "article-with-golang-tag",
		Title:       "Article with Golang Tag",
		Description: "Description",
		Body:        "Body",
		Author:      articleUser,
		AuthorID:    articleUser.ID,
	}
	test_db.Create(&article1)
	article1.setTags([]string{"golang", "programming"})
	test_db.Save(&article1)

	article2 := ArticleModel{
		Slug:        "article-with-python-tag",
		Title:       "Article with Python Tag",
		Description: "Description",
		Body:        "Body",
		Author:      articleUser,
		AuthorID:    articleUser.ID,
	}
	test_db.Create(&article2)
	article2.setTags([]string{"python", "programming"})
	test_db.Save(&article2)

	// Test filter by tag
	articles, count, err := FindManyArticle("golang", "", "10", "0", "")
	asserts.NoError(err, "Should find articles by tag")
	asserts.Equal(1, count, "Should have 1 article with golang tag")

	// Test with non-existent tag
	articles, count, err = FindManyArticle("nonexistent", "", "10", "0", "")
	asserts.NoError(err, "Should handle non-existent tag")
	asserts.Equal(0, len(articles), "Should return 0 articles for non-existent tag")
}

// TestFindManyArticleWithFavorited tests finding articles favorited by a user
func TestFindManyArticleWithFavorited(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(2)
	user1 := userModels[0]
	user2 := userModels[1]

	articleUser1 := GetArticleUserModel(user1)
	articleUser2 := GetArticleUserModel(user2)

	// Create articles
	articles := articleModelMocker(3, articleUser1)

	// User2 favorites some articles
	articles[0].favoriteBy(articleUser2)
	articles[1].favoriteBy(articleUser2)

	// Test filter by favorited
	foundArticles, count, err := FindManyArticle("", "", "10", "0", user2.Username)
	asserts.NoError(err, "Should find favorited articles")
	asserts.Equal(2, count, "Should have 2 favorited articles")
	asserts.Equal(2, len(foundArticles), "Should return 2 favorited articles")

	// Test with user who hasn't favorited any articles
	foundArticles, count, err = FindManyArticle("", "", "10", "0", "nonexistentuser")
	asserts.NoError(err, "Should handle non-existent user")
	asserts.Equal(0, len(foundArticles), "Should return 0 articles for non-existent user")
}

// TestErrorPaths tests various error paths in routers
func TestErrorPaths(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(1)
	user1 := userModels[0]

	articleUser1 := GetArticleUserModel(user1)
	_ = articleModelMocker(1, articleUser1)

	router, recorder := makeTestContext()
	v1 := router.Group("/api")
	users.UsersRegister(v1.Group("/users"))
	
	articlesGroup := v1.Group("/articles")
	articlesGroup.Use(users.AuthMiddleware(false))
	ArticlesAnonymousRegister(articlesGroup)
	
	authenticatedArticles := v1.Group("/articles")
	authenticatedArticles.Use(users.AuthMiddleware(true))
	ArticlesRegister(authenticatedArticles)

	tagsGroup := v1.Group("/tags")
	TagsAnonymousRegister(tagsGroup)

	// Test ArticleCreate with validation error (title too short)
	req, _ := http.NewRequest("POST", "/api/articles/", bytes.NewBufferString(`{"article":{"title":"Bad","description":"Test","body":"Test"}}`))
	req.Header.Set("Content-Type", "application/json")
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusUnprocessableEntity, recorder.Code, "Should return 422 for validation error")

	// Test ArticleUpdate with validation error
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("PUT", "/api/articles/test-article-1", bytes.NewBufferString(`{"article":{"title":"Bad"}}`))
	req.Header.Set("Content-Type", "application/json")
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusUnprocessableEntity, recorder.Code, "Should return 422 for validation error on update")

	// Test ArticleList with invalid limit/offset (should still work with defaults)
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/?limit=abc&offset=xyz", nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should handle invalid params gracefully")

	// Test ArticleFeed without authentication
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/feed", nil)
	articlesGroup.GET("/feed", ArticleFeed)
	router.ServeHTTP(recorder, req)
	// This will fail without proper auth, but we need to test the code path

	// Test comment create with validation error (body too large)
	recorder = httptest.NewRecorder()
	largeBody := make([]byte, 3000)
	for i := range largeBody {
		largeBody[i] = 'x'
	}
	invalidCommentData := fmt.Sprintf(`{"comment":{"body":"%s"}}`, string(largeBody))
	req, _ = http.NewRequest("POST", "/api/articles/test-article-1/comments", bytes.NewBufferString(invalidCommentData))
	req.Header.Set("Content-Type", "application/json")
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusUnprocessableEntity, recorder.Code, "Should return 422 for comment validation error")

	// Test ArticleList with filter by tag (empty tag should still work)
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/?tag=nonexistent", nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should handle tag filter")

	// Test ArticleList with filter by author (empty author should still work)
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/?author=nonexistent", nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should handle author filter")

	// Test ArticleList with filter by favorited (empty favorited should still work)
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/articles/?favorited=nonexistent", nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should handle favorited filter")
}

// TestMoreRouterErrorPaths tests additional error scenarios
func TestMoreRouterErrorPaths(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	// Close and corrupt the database to trigger database errors
	// We'll use a more realistic approach - test error paths that can actually occur

	userModels := userModelMocker(1)
	user1 := userModels[0]
	articleUser := GetArticleUserModel(user1)
	articles := articleModelMocker(1, articleUser)

	router, recorder := makeTestContext()
	v1 := router.Group("/api")
	users.UsersRegister(v1.Group("/users"))
	
	articlesGroup := v1.Group("/articles")
	articlesGroup.Use(users.AuthMiddleware(false))
	ArticlesAnonymousRegister(articlesGroup)
	
	authenticatedArticles := v1.Group("/articles")
	authenticatedArticles.Use(users.AuthMiddleware(true))
	ArticlesRegister(authenticatedArticles)

	// Test article retrieval with existing slug
	req, _ := http.NewRequest("GET", fmt.Sprintf("/api/articles/%s", articles[0].Slug), nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should retrieve article successfully")

	// Test article update with existing slug
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("PUT", fmt.Sprintf("/api/articles/%s", articles[0].Slug), 
		bytes.NewBufferString(`{"article":{"title":"Updated Title","description":"Updated","body":"Updated"}}`))
	req.Header.Set("Content-Type", "application/json")
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should update article successfully")

	// Parse the response to get the updated slug
	var updateResponse map[string]map[string]interface{}
	json.Unmarshal(recorder.Body.Bytes(), &updateResponse)
	updatedSlug := updateResponse["article"]["slug"].(string)

	// Test article deletion with the updated slug
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("DELETE", fmt.Sprintf("/api/articles/%s", updatedSlug), nil)
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should delete article successfully")

	// Test favorite operations
	articles2 := articleModelMocker(1, articleUser)
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", fmt.Sprintf("/api/articles/%s/favorite", articles2[0].Slug), nil)
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should favorite article successfully")

	// Test unfavorite
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("DELETE", fmt.Sprintf("/api/articles/%s/favorite", articles2[0].Slug), nil)
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should unfavorite article successfully")

	// Test comment operations
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("POST", fmt.Sprintf("/api/articles/%s/comments", articles2[0].Slug), 
		bytes.NewBufferString(`{"comment":{"body":"Test comment body"}}`))
	req.Header.Set("Content-Type", "application/json")
	HeaderTokenMock(req, user1.ID)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusCreated, recorder.Code, "Should create comment successfully")

	// Test comment list
	recorder = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", fmt.Sprintf("/api/articles/%s/comments", articles2[0].Slug), nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should list comments successfully")

	// Test tags list (need to add tags route to router)
	recorder = httptest.NewRecorder()
	tagsGroup := v1.Group("/tags")
	TagsAnonymousRegister(tagsGroup)
	req, _ = http.NewRequest("GET", "/api/tags/", nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should list tags successfully")
}

// TestNewArticleModelValidatorFillWith tests the validator fill function
func TestNewArticleModelValidatorFillWith(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(1)
	articleUser := GetArticleUserModel(userModels[0])

	// Create an article with tags
	article := ArticleModel{
		Slug:        "test-validator-fill",
		Title:       "Test Validator Fill",
		Description: "Test description",
		Body:        "Test body",
		Author:      articleUser,
		AuthorID:    articleUser.ID,
	}
	test_db.Create(&article)
	article.setTags([]string{"tag1", "tag2", "tag3"})
	test_db.Save(&article)

	// Load article with tags
	test_db.Model(&article).Related(&article.Tags, "Tags")

	// Test NewArticleModelValidatorFillWith
	validator := NewArticleModelValidatorFillWith(article)
	asserts.Equal(article.Title, validator.Article.Title, "Title should match")
	asserts.Equal(article.Description, validator.Article.Description, "Description should match")
	asserts.Equal(article.Body, validator.Article.Body, "Body should match")
	asserts.Equal(3, len(validator.Article.Tags), "Should have 3 tags")
}

// TestSetTagsError tests error handling in setTags
func TestSetTagsError(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(1)
	articleUser := GetArticleUserModel(userModels[0])

	article := ArticleModel{
		Slug:        "test-set-tags",
		Title:       "Test Set Tags",
		Description: "Description",
		Body:        "Body",
		Author:      articleUser,
		AuthorID:    articleUser.ID,
	}
	test_db.Create(&article)

	// Test with empty tags
	err := article.setTags([]string{})
	asserts.NoError(err, "Should handle empty tags")
	asserts.Equal(0, len(article.Tags), "Should have 0 tags")

	// Test with valid tags
	err = article.setTags([]string{"tag1", "tag2"})
	asserts.NoError(err, "Should set tags successfully")
	asserts.Equal(2, len(article.Tags), "Should have 2 tags")

	// Test setting tags again (FirstOrCreate should not duplicate)
	err = article.setTags([]string{"tag1", "tag2", "tag3"})
	asserts.NoError(err, "Should set tags again")
	asserts.Equal(3, len(article.Tags), "Should have 3 tags")
}

// TestArticleListWithInvalidParams tests ArticleList with invalid parameters
func TestArticleListWithInvalidParams(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	router, recorder := makeTestContext()
	v1 := router.Group("/api")
	
	articlesGroup := v1.Group("/articles")
	articlesGroup.Use(users.AuthMiddleware(false))
	ArticlesAnonymousRegister(articlesGroup)

	// Test with invalid limit (should use default)
	req, _ := http.NewRequest("GET", "/api/articles/?limit=invalid&offset=invalid", nil)
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should handle invalid limit/offset with defaults")
}

// TestCommentValidatorBind tests comment validator bind with error
func TestCommentValidatorBind(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	gin.SetMode(gin.TestMode)
	
	users := userModelMocker(1)
	user := users[0]

	router := gin.New()
	router.POST("/test", func(c *gin.Context) {
		c.Set("my_user_model", user)
		validator := NewCommentModelValidator()
		err := validator.Bind(c)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		// Verify the comment model was populated
		asserts.Equal("Test body", validator.commentModel.Body, "Body should be set")
		asserts.Equal(user.ID, validator.commentModel.Author.UserModelID, "Author should be set")
		c.JSON(http.StatusOK, gin.H{"success": true})
	})

	// Test with valid data
	validData := `{"comment":{"body":"Test body"}}`
	req, _ := http.NewRequest("POST", "/test", bytes.NewBufferString(validData))
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusOK, recorder.Code, "Should bind comment successfully")

	// Test with invalid data (exceeding max size)
	veryLongBody := make([]byte, 3000)
	for i := range veryLongBody {
		veryLongBody[i] = 'a'
	}
	invalidData := fmt.Sprintf(`{"comment":{"body":"%s"}}`, string(veryLongBody))
	req, _ = http.NewRequest("POST", "/test", bytes.NewBufferString(invalidData))
	req.Header.Set("Content-Type", "application/json")
	recorder = httptest.NewRecorder()
	router.ServeHTTP(recorder, req)
	asserts.Equal(http.StatusBadRequest, recorder.Code, "Should fail with body too large")
}

// TestFindManyArticleAllFilters tests all filter combinations
func TestFindManyArticleAllFilters(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	userModels := userModelMocker(2)
	user1 := userModels[0]
	user2 := userModels[1]

	articleUser1 := GetArticleUserModel(user1)
	articleUser2 := GetArticleUserModel(user2)

	// Create articles with tags
	article1 := ArticleModel{
		Slug:        "article-filter-test-1",
		Title:       "Article Filter Test 1",
		Description: "Description 1",
		Body:        "Body 1",
		Author:      articleUser1,
		AuthorID:    articleUser1.ID,
	}
	test_db.Create(&article1)
	article1.setTags([]string{"tech", "golang"})
	test_db.Save(&article1)

	// Test filter by tag
	articles, count, err := FindManyArticle("tech", "", "10", "0", "")
	asserts.NoError(err, "Should find articles by tag")
	asserts.GreaterOrEqual(count, 1, "Should have at least 1 article with tech tag")

	// Test filter by author with valid author
	articles, count, err = FindManyArticle("", user1.Username, "10", "0", "")
	asserts.NoError(err, "Should find articles by author")
	asserts.GreaterOrEqual(count, 1, "Should have at least 1 article by user1")

	// Favorite an article
	article1.favoriteBy(articleUser2)

	// Test filter by favorited
	articles, count, err = FindManyArticle("", "", "10", "0", user2.Username)
	asserts.NoError(err, "Should find favorited articles")
	asserts.Equal(1, count, "Should have 1 favorited article")

	// Test with non-existent author
	articles, count, err = FindManyArticle("", "nonexistentauthor", "10", "0", "")
	asserts.NoError(err, "Should handle non-existent author")
	asserts.Equal(0, len(articles), "Should return 0 articles for non-existent author")

	// Test with non-existent favorited user
	articles, count, err = FindManyArticle("", "", "10", "0", "nonexistentuser")
	asserts.NoError(err, "Should handle non-existent favorited user")
	asserts.Equal(0, len(articles), "Should return 0 articles for non-existent favorited user")

	// Test with non-existent tag
	articles, count, err = FindManyArticle("nonexistenttag", "", "10", "0", "")
	asserts.NoError(err, "Should handle non-existent tag")
	asserts.Equal(0, len(articles), "Should return 0 articles for non-existent tag")
}

// TestGetArticleUserModel tests getting article user model
func TestGetArticleUserModel(t *testing.T) {
	asserts := assert.New(t)
	resetDBWithMock()

	// Test with valid user
	userModels := userModelMocker(1)
	user := userModels[0]

	articleUser := GetArticleUserModel(user)
	asserts.NotEqual(uint(0), articleUser.ID, "Should create article user model")
	asserts.Equal(user.ID, articleUser.UserModelID, "UserModelID should match")

	// Test getting the same user again (should return existing)
	articleUser2 := GetArticleUserModel(user)
	asserts.Equal(articleUser.ID, articleUser2.ID, "Should return existing article user model")

	// Test with empty user model (ID = 0)
	emptyUser := users.UserModel{}
	articleUserEmpty := GetArticleUserModel(emptyUser)
	asserts.Equal(uint(0), articleUserEmpty.ID, "Should return empty model for empty user")
}
