const { test, expect } = require("@playwright/test");
const articleListReducer = require("../../src/reducers/articleList").default;
const {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  HOME_PAGE_LOADED,
  HOME_PAGE_UNLOADED,
  CHANGE_TAB,
  PROFILE_PAGE_LOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_LOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED,
} = require("../../src/constants/actionTypes");

test.describe("articleList reducer", () => {
  test("should return initial state", () => {
    expect(articleListReducer(undefined, {})).toEqual({});
  });

  test.describe("ARTICLE_FAVORITED action", () => {
    test("should update favorited article in list", () => {
      const articles = [
        { slug: "article-1", favorited: false, favoritesCount: 5 },
        { slug: "article-2", favorited: false, favoritesCount: 10 },
        { slug: "article-3", favorited: false, favoritesCount: 3 },
      ];
      const action = {
        type: ARTICLE_FAVORITED,
        payload: {
          article: { slug: "article-2", favorited: true, favoritesCount: 11 },
        },
      };
      const result = articleListReducer({ articles }, action);
      expect(result.articles[1].favorited).toBe(true);
      expect(result.articles[1].favoritesCount).toBe(11);
      expect(result.articles[0].favorited).toBe(false);
      expect(result.articles[2].favorited).toBe(false);
    });

    test("should not modify other articles", () => {
      const articles = [
        {
          slug: "article-1",
          title: "Title 1",
          favorited: false,
          favoritesCount: 5,
        },
        {
          slug: "article-2",
          title: "Title 2",
          favorited: false,
          favoritesCount: 10,
        },
      ];
      const action = {
        type: ARTICLE_FAVORITED,
        payload: {
          article: { slug: "article-1", favorited: true, favoritesCount: 6 },
        },
      };
      const result = articleListReducer({ articles }, action);
      expect(result.articles[0].title).toBe("Title 1");
      expect(result.articles[1].title).toBe("Title 2");
    });
  });

  test.describe("ARTICLE_UNFAVORITED action", () => {
    test("should update unfavorited article in list", () => {
      const articles = [
        { slug: "article-1", favorited: true, favoritesCount: 5 },
        { slug: "article-2", favorited: true, favoritesCount: 10 },
      ];
      const action = {
        type: ARTICLE_UNFAVORITED,
        payload: {
          article: { slug: "article-1", favorited: false, favoritesCount: 4 },
        },
      };
      const result = articleListReducer({ articles }, action);
      expect(result.articles[0].favorited).toBe(false);
      expect(result.articles[0].favoritesCount).toBe(4);
      expect(result.articles[1].favorited).toBe(true);
    });
  });

  test.describe("SET_PAGE action", () => {
    test("should set page with articles", () => {
      const articles = [
        { slug: "article-1", title: "Article 1" },
        { slug: "article-2", title: "Article 2" },
      ];
      const action = {
        type: SET_PAGE,
        payload: { articles, articlesCount: 20 },
        page: 2,
      };
      const result = articleListReducer({}, action);
      expect(result.articles).toEqual(articles);
      expect(result.articlesCount).toBe(20);
      expect(result.currentPage).toBe(2);
    });

    test("should update current page", () => {
      const currentState = {
        articles: [{ slug: "old" }],
        currentPage: 0,
      };
      const newArticles = [{ slug: "new" }];
      const action = {
        type: SET_PAGE,
        payload: { articles: newArticles, articlesCount: 15 },
        page: 3,
      };
      const result = articleListReducer(currentState, action);
      expect(result.currentPage).toBe(3);
    });
  });

  test.describe("APPLY_TAG_FILTER action", () => {
    test("should apply tag filter and reset page", () => {
      const articles = [{ slug: "filtered-article", tagList: ["react"] }];
      const action = {
        type: APPLY_TAG_FILTER,
        payload: { articles, articlesCount: 5 },
        pager: () => {},
        tag: "react",
      };
      const result = articleListReducer({}, action);
      expect(result.articles).toEqual(articles);
      expect(result.articlesCount).toBe(5);
      expect(result.tag).toBe("react");
      expect(result.tab).toBe(null);
      expect(result.currentPage).toBe(0);
    });

    test("should clear previous tab when filtering by tag", () => {
      const currentState = { tab: "feed", tag: null };
      const action = {
        type: APPLY_TAG_FILTER,
        payload: { articles: [], articlesCount: 0 },
        pager: () => {},
        tag: "javascript",
      };
      const result = articleListReducer(currentState, action);
      expect(result.tab).toBe(null);
      expect(result.tag).toBe("javascript");
    });
  });

  test.describe("HOME_PAGE_LOADED action", () => {
    test("should load home page with tags and articles", () => {
      const tags = ["react", "javascript", "nodejs"];
      const articles = [
        { slug: "article-1", title: "Article 1" },
        { slug: "article-2", title: "Article 2" },
      ];
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [{ tags }, { articles, articlesCount: 10 }],
        pager: () => {},
        tab: "all",
      };
      const result = articleListReducer({}, action);
      expect(result.tags).toEqual(tags);
      expect(result.articles).toEqual(articles);
      expect(result.articlesCount).toBe(10);
      expect(result.currentPage).toBe(0);
      expect(result.tab).toBe("all");
    });

    test("should handle empty payload", () => {
      const action = {
        type: HOME_PAGE_LOADED,
        payload: null,
        pager: () => {},
        tab: "all",
      };
      const result = articleListReducer({}, action);
      expect(result.tags).toEqual([]);
      expect(result.articles).toEqual([]);
      expect(result.articlesCount).toBe(0);
    });

    test("should handle missing tags in payload", () => {
      const articles = [{ slug: "article-1" }];
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [null, { articles, articlesCount: 5 }],
        pager: () => {},
        tab: "all",
      };
      const result = articleListReducer({}, action);
      expect(result.tags).toEqual([]);
      expect(result.articles).toEqual(articles);
    });
  });

  test.describe("HOME_PAGE_UNLOADED action", () => {
    test("should reset state when home page unloaded", () => {
      const currentState = {
        tags: ["react", "javascript"],
        articles: [{ slug: "article-1" }],
        articlesCount: 10,
        currentPage: 2,
        tab: "feed",
      };
      const result = articleListReducer(currentState, {
        type: HOME_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  test.describe("CHANGE_TAB action", () => {
    test("should change tab and load articles", () => {
      const articles = [{ slug: "feed-article" }];
      const action = {
        type: CHANGE_TAB,
        payload: { articles, articlesCount: 15 },
        pager: () => {},
        tab: "feed",
      };
      const result = articleListReducer({}, action);
      expect(result.articles).toEqual(articles);
      expect(result.articlesCount).toBe(15);
      expect(result.tab).toBe("feed");
      expect(result.currentPage).toBe(0);
      expect(result.tag).toBe(null);
    });

    test("should clear tag when changing tab", () => {
      const currentState = { tag: "react", tab: "all" };
      const action = {
        type: CHANGE_TAB,
        payload: { articles: [], articlesCount: 0 },
        pager: () => {},
        tab: "feed",
      };
      const result = articleListReducer(currentState, action);
      expect(result.tag).toBe(null);
    });
  });

  test.describe("PROFILE_PAGE_LOADED action", () => {
    test("should load profile page with articles", () => {
      const profile = { username: "testuser", bio: "Test bio" };
      const articles = [
        { slug: "user-article-1", title: "User Article 1" },
        { slug: "user-article-2", title: "User Article 2" },
      ];
      const action = {
        type: PROFILE_PAGE_LOADED,
        payload: [{ profile }, { articles, articlesCount: 8 }],
        pager: () => {},
      };
      const result = articleListReducer({}, action);
      expect(result.articles).toEqual(articles);
      expect(result.articlesCount).toBe(8);
      expect(result.currentPage).toBe(0);
    });
  });

  test.describe("PROFILE_FAVORITES_PAGE_LOADED action", () => {
    test("should load favorited articles", () => {
      const profile = { username: "testuser" };
      const articles = [{ slug: "favorited-article", favorited: true }];
      const action = {
        type: PROFILE_FAVORITES_PAGE_LOADED,
        payload: [{ profile }, { articles, articlesCount: 3 }],
        pager: () => {},
      };
      const result = articleListReducer({}, action);
      expect(result.articles).toEqual(articles);
      expect(result.articlesCount).toBe(3);
      expect(result.currentPage).toBe(0);
    });
  });

  test.describe("PROFILE_PAGE_UNLOADED action", () => {
    test("should reset state when profile page unloaded", () => {
      const currentState = {
        articles: [{ slug: "user-article" }],
        articlesCount: 5,
      };
      const result = articleListReducer(currentState, {
        type: PROFILE_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  test.describe("PROFILE_FAVORITES_PAGE_UNLOADED action", () => {
    test("should reset state when profile favorites page unloaded", () => {
      const currentState = {
        articles: [{ slug: "favorited-article" }],
        articlesCount: 3,
      };
      const result = articleListReducer(currentState, {
        type: PROFILE_FAVORITES_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  test.describe("state immutability", () => {
    test("should not mutate original articles array on ARTICLE_FAVORITED", () => {
      const originalArticles = [
        { slug: "article-1", favorited: false, favoritesCount: 5 },
      ];
      const originalState = { articles: originalArticles };
      const action = {
        type: ARTICLE_FAVORITED,
        payload: {
          article: { slug: "article-1", favorited: true, favoritesCount: 6 },
        },
      };
      articleListReducer(originalState, action);
      expect(originalState.articles[0].favorited).toBe(false);
      expect(originalState.articles[0].favoritesCount).toBe(5);
    });
  });

  test.describe("unknown action", () => {
    test("should return current state for unknown action", () => {
      const currentState = { articles: [{ slug: "test" }], articlesCount: 1 };
      const action = { type: "UNKNOWN_ACTION" };
      const result = articleListReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
