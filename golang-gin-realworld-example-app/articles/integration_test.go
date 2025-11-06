package articles

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"realworld-backend/common"
	"realworld-backend/users"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// setupArticlesRouter creates a test router with article routes
func setupArticlesRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	
	v1 := r.Group("/api")
	users.UsersRegister(v1.Group("/users"))
	v1.Use(users.AuthMiddleware(false))
	ArticlesAnonymousRegister(v1.Group("/articles"))
	TagsAnonymousRegister(v1.Group("/tags"))
	
	v1.Use(users.AuthMiddleware(true))
	users.UserRegister(v1.Group("/user"))
	users.ProfileRegister(v1.Group("/profiles"))
	ArticlesRegister(v1.Group("/articles"))
	
	return r
}

// TestIntegration_Articles_CreateArticle tests complete article creation flow
func TestIntegration_Articles_CreateArticle(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	// Create user and get token
	userModels := userModelMocker(1)
	user := userModels[0]
	token := common.GenToken(user.ID)
	
	// Prepare article data
	articleBody := map[string]interface{}{
		"article": map[string]interface{}{
			"title":       "Test Article",
			"description": "This is a test article",
			"body":        "Article content goes here",
			"tagList":     []string{"golang", "testing"},
		},
	}
	jsonBody, _ := json.Marshal(articleBody)
	
	// Execute
	req, _ := http.NewRequest("POST", "/api/articles/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusCreated, w.Code, "Should return 201 Created")
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "article")
	article := response["article"].(map[string]interface{})
	asserts.Equal("Test Article", article["title"])
	asserts.NotEmpty(article["slug"], "Slug should be generated")
	asserts.Contains(article, "author")
	
	// Verify in database
	slug := article["slug"].(string)
	dbArticle, err := FindOneArticle(&ArticleModel{Slug: slug})
	asserts.NoError(err, "Article should exist in database")
	asserts.Equal("Test Article", dbArticle.Title)
}

// TestIntegration_Articles_CreateArticleWithTags tests tag association
func TestIntegration_Articles_CreateArticleWithTags(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(1)
	user := userModels[0]
	token := common.GenToken(user.ID)
	
	// Create first article with tags
	articleBody1 := map[string]interface{}{
		"article": map[string]interface{}{
			"title":       "Article 1",
			"description": "Description 1",
			"body":        "Body 1",
			"tagList":     []string{"golang", "testing", "backend"},
		},
	}
	jsonBody1, _ := json.Marshal(articleBody1)
	
	req1, _ := http.NewRequest("POST", "/api/articles/", bytes.NewBuffer(jsonBody1))
	req1.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	req1.Header.Set("Content-Type", "application/json")
	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	
	asserts.Equal(http.StatusCreated, w1.Code)
	
	// Create second article with overlapping tags
	articleBody2 := map[string]interface{}{
		"article": map[string]interface{}{
			"title":       "Article 2",
			"description": "Description 2",
			"body":        "Body 2",
			"tagList":     []string{"golang", "frontend"}, // golang overlaps
		},
	}
	jsonBody2, _ := json.Marshal(articleBody2)
	
	req2, _ := http.NewRequest("POST", "/api/articles/", bytes.NewBuffer(jsonBody2))
	req2.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	req2.Header.Set("Content-Type", "application/json")
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	
	asserts.Equal(http.StatusCreated, w2.Code)
	
	// Verify tags (should have 4 unique tags: golang, testing, backend, frontend)
	db := common.GetDB()
	var tagCount int
	db.Model(&TagModel{}).Count(&tagCount)
	asserts.GreaterOrEqual(tagCount, 4, "Should have at least 4 unique tags")
}

// TestIntegration_Articles_CreateWithoutAuth tests authorization
func TestIntegration_Articles_CreateWithoutAuth(t *testing.T) {
	asserts := assert.New(t)
	
	resetDBWithMock()
	router := setupArticlesRouter()
	
	articleBody := map[string]interface{}{
		"article": map[string]interface{}{
			"title":       "Test Article",
			"description": "Description",
			"body":        "Body",
		},
	}
	jsonBody, _ := json.Marshal(articleBody)
	
	req, _ := http.NewRequest("POST", "/api/articles/", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	asserts.Equal(http.StatusUnauthorized, w.Code, "Should require authentication")
}

// TestIntegration_Articles_ListArticles tests article listing with filters
func TestIntegration_Articles_ListArticles(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	// Create users and articles
	userModels := userModelMocker(2)
	user1 := userModels[0]
	user2 := userModels[1]
	
	articleUser1 := GetArticleUserModel(user1)
	articleUser2 := GetArticleUserModel(user2)
	
	articleModelMocker(3, articleUser1)
	articleModelMocker(2, articleUser2)
	
	// Test without filters
	req, _ := http.NewRequest("GET", "/api/articles/", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "articles")
	articles := response["articles"].([]interface{})
	asserts.GreaterOrEqual(len(articles), 5, "Should return all articles")
	
	// Test with limit
	req2, _ := http.NewRequest("GET", "/api/articles/?limit=2", nil)
	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)
	
	asserts.Equal(http.StatusOK, w2.Code)
}

// TestIntegration_Articles_RetrieveSingleArticle tests article retrieval by slug
func TestIntegration_Articles_RetrieveSingleArticle(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(1)
	user := userModels[0]
	articleUser := GetArticleUserModel(user)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	// Execute
	req, _ := http.NewRequest("GET", fmt.Sprintf("/api/articles/%s", article.Slug), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "article")
	articleResp := response["article"].(map[string]interface{})
	asserts.Equal(article.Slug, articleResp["slug"])
	asserts.Equal(article.Title, articleResp["title"])
}

// TestIntegration_Articles_RetrieveNonexistent tests error handling
func TestIntegration_Articles_RetrieveNonexistent(t *testing.T) {
	asserts := assert.New(t)
	
	resetDBWithMock()
	router := setupArticlesRouter()
	
	req, _ := http.NewRequest("GET", "/api/articles/nonexistent-slug", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	asserts.Equal(http.StatusNotFound, w.Code, "Should return 404 for non-existent article")
}

// TestIntegration_Articles_UpdateArticle tests article update functionality
func TestIntegration_Articles_UpdateArticle(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(1)
	user := userModels[0]
	token := common.GenToken(user.ID)
	articleUser := GetArticleUserModel(user)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	// Update request
	updateBody := map[string]interface{}{
		"article": map[string]interface{}{
			"title":       "Updated Title",
			"description": "Updated description",
			"body":        "Updated body content",
		},
	}
	jsonBody, _ := json.Marshal(updateBody)
	
	req, _ := http.NewRequest("PUT", fmt.Sprintf("/api/articles/%s", article.Slug), bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	articleResp := response["article"].(map[string]interface{})
	asserts.Equal("Updated Title", articleResp["title"])
	asserts.Equal("Updated description", articleResp["description"])
}

// TestIntegration_Articles_DeleteArticle tests article deletion
func TestIntegration_Articles_DeleteArticle(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(1)
	user := userModels[0]
	token := common.GenToken(user.ID)
	articleUser := GetArticleUserModel(user)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	// Execute
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/articles/%s", article.Slug), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	// Verify deletion in database
	_, err := FindOneArticle(&ArticleModel{Slug: article.Slug})
	asserts.Error(err, "Article should be deleted from database")
}

// TestIntegration_Articles_FavoriteArticle tests favorite functionality
func TestIntegration_Articles_FavoriteArticle(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(2)
	author := userModels[0]
	favoriter := userModels[1]
	
	articleUser := GetArticleUserModel(author)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	token := common.GenToken(favoriter.ID)
	
	// Execute
	req, _ := http.NewRequest("POST", fmt.Sprintf("/api/articles/%s/favorite", article.Slug), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	articleResp := response["article"].(map[string]interface{})
	asserts.Equal(true, articleResp["favorited"])
	
	// Verify in database
	favArticleUser := GetArticleUserModel(favoriter)
	dbArticle, _ := FindOneArticle(&ArticleModel{Slug: article.Slug})
	asserts.True(dbArticle.isFavoriteBy(favArticleUser), "Favorite relationship should exist")
}

// TestIntegration_Articles_UnfavoriteArticle tests unfavorite functionality
func TestIntegration_Articles_UnfavoriteArticle(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(2)
	author := userModels[0]
	favoriter := userModels[1]
	
	articleUser := GetArticleUserModel(author)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	// Create favorite relationship
	favArticleUser := GetArticleUserModel(favoriter)
	article.favoriteBy(favArticleUser)
	
	token := common.GenToken(favoriter.ID)
	
	// Execute
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/articles/%s/favorite", article.Slug), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	articleResp := response["article"].(map[string]interface{})
	asserts.Equal(false, articleResp["favorited"])
}

// TestIntegration_Articles_CreateComment tests comment creation
func TestIntegration_Articles_CreateComment(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(2)
	author := userModels[0]
	commenter := userModels[1]
	
	articleUser := GetArticleUserModel(author)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	token := common.GenToken(commenter.ID)
	
	// Comment data
	commentBody := map[string]interface{}{
		"comment": map[string]interface{}{
			"body": "This is a test comment",
		},
	}
	jsonBody, _ := json.Marshal(commentBody)
	
	// Execute
	req, _ := http.NewRequest("POST", fmt.Sprintf("/api/articles/%s/comments", article.Slug), bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusCreated, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "comment")
	comment := response["comment"].(map[string]interface{})
	asserts.Equal("This is a test comment", comment["body"])
}

// TestIntegration_Articles_ListComments tests comment retrieval
func TestIntegration_Articles_ListComments(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(1)
	user := userModels[0]
	articleUser := GetArticleUserModel(user)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	// Create comments directly in database
	db := common.GetDB()
	for i := 0; i < 3; i++ {
		comment := CommentModel{
			Article:  article,
			ArticleID: article.ID,
			Author:   articleUser,
			AuthorID: articleUser.ID,
			Body:     fmt.Sprintf("Comment %d", i+1),
		}
		db.Create(&comment)
	}
	
	// Execute
	req, _ := http.NewRequest("GET", fmt.Sprintf("/api/articles/%s/comments", article.Slug), nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "comments")
	comments := response["comments"].([]interface{})
	asserts.Equal(3, len(comments), "Should return all 3 comments")
}

// TestIntegration_Articles_DeleteComment tests comment deletion
func TestIntegration_Articles_DeleteComment(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	userModels := userModelMocker(1)
	user := userModels[0]
	articleUser := GetArticleUserModel(user)
	articles := articleModelMocker(1, articleUser)
	article := articles[0]
	
	// Create comment
	db := common.GetDB()
	comment := CommentModel{
		Article:  article,
		ArticleID: article.ID,
		Author:   articleUser,
		AuthorID: articleUser.ID,
		Body:     "Test comment",
	}
	db.Create(&comment)
	
	token := common.GenToken(user.ID)
	
	// Execute
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/api/articles/%s/comments/%d", article.Slug, comment.ID), nil)
	req.Header.Set("Authorization", fmt.Sprintf("Token %s", token))
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	// Verify deletion
	var deletedComment CommentModel
	err := db.First(&deletedComment, comment.ID).Error
	asserts.Error(err, "Comment should be deleted")
}

// TestIntegration_Articles_ListTags tests tag listing
func TestIntegration_Articles_ListTags(t *testing.T) {
	asserts := assert.New(t)
	
	// Setup
	resetDBWithMock()
	router := setupArticlesRouter()
	
	// Create articles with tags
	userModels := userModelMocker(1)
	user := userModels[0]
	articleUser := GetArticleUserModel(user)
	
	db := common.GetDB()
	tagsList := []string{"golang", "testing", "backend", "api"}
	for i, tagName := range tagsList {
		article := ArticleModel{
			Slug:        fmt.Sprintf("article-%d", i),
			Title:       fmt.Sprintf("Article %d", i),
			Description: "Description",
			Body:        "Body",
			Author:      articleUser,
			AuthorID:    articleUser.ID,
		}
		db.Create(&article)
		
		tag := TagModel{Tag: tagName}
		db.FirstOrCreate(&tag, tag)
		db.Model(&article).Association("Tags").Append(&tag)
	}
	
	// Execute
	req, _ := http.NewRequest("GET", "/api/tags/", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	
	// Assert
	asserts.Equal(http.StatusOK, w.Code)
	
	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	asserts.Contains(response, "tags")
	
	// Convert interface{} to []string properly
	tagsInterface := response["tags"].([]interface{})
	tags := make([]string, len(tagsInterface))
	for i, v := range tagsInterface {
		tags[i] = v.(string)
	}
	asserts.GreaterOrEqual(len(tags), 4, "Should return all unique tags")
}
