const { test, expect } = require('@playwright/test');
const articleReducer = require('../../src/reducers/article').default;
const {
  ARTICLE_PAGE_LOADED,
  ARTICLE_PAGE_UNLOADED,
  ADD_COMMENT,
  DELETE_COMMENT,
} = require('../../src/constants/actionTypes');

test.describe("article reducer", () => {
  test("should return initial state", () => {
    expect(articleReducer(undefined, {})).toEqual({});
  });

  test.describe("ARTICLE_PAGE_LOADED action", () => {
    test("should load article and comments", () => {
      const article = {
        slug: "test-article",
        title: "Test Article",
        body: "Article body",
        author: { username: "testuser" },
      };
      const comments = [
        { id: 1, body: "Great article!" },
        { id: 2, body: "Thanks for sharing" },
      ];
      const action = {
        type: ARTICLE_PAGE_LOADED,
        payload: [{ article }, { comments }],
      };
      const result = articleReducer({}, action);
      expect(result).toEqual({
        article,
        comments,
      });
    });

    test("should handle empty comments", () => {
      const article = { slug: "test-article", title: "Test Article" };
      const action = {
        type: ARTICLE_PAGE_LOADED,
        payload: [{ article }, { comments: [] }],
      };
      const result = articleReducer({}, action);
      expect(result).toEqual({
        article,
        comments: [],
      });
    });
  });

  test.describe("ARTICLE_PAGE_UNLOADED action", () => {
    test("should reset state when page unloaded", () => {
      const currentState = {
        article: { slug: "test", title: "Test" },
        comments: [{ id: 1, body: "Comment" }],
      };
      const result = articleReducer(currentState, {
        type: ARTICLE_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  test.describe("ADD_COMMENT action", () => {
    test("should add comment to empty list", () => {
      const newComment = {
        id: 1,
        body: "New comment",
        author: { username: "user" },
      };
      const action = {
        type: ADD_COMMENT,
        error: false,
        payload: { comment: newComment },
      };
      const result = articleReducer({ comments: [] }, action);
      expect(result).toEqual({
        commentErrors: null,
        comments: [newComment],
      });
    });

    test("should add comment to existing list", () => {
      const existingComments = [
        { id: 1, body: "First comment" },
        { id: 2, body: "Second comment" },
      ];
      const newComment = { id: 3, body: "Third comment" };
      const action = {
        type: ADD_COMMENT,
        error: false,
        payload: { comment: newComment },
      };
      const result = articleReducer({ comments: existingComments }, action);
      expect(result.comments).toHaveLength(3);
      expect(result.comments[2]).toEqual(newComment);
    });

    test("should handle ADD_COMMENT error", () => {
      const errors = { body: ["can't be blank"] };
      const action = {
        type: ADD_COMMENT,
        error: true,
        payload: { errors },
      };
      const result = articleReducer({ comments: [] }, action);
      expect(result).toEqual({
        commentErrors: errors,
        comments: null,
      });
    });

    test("should handle null comments state", () => {
      const newComment = { id: 1, body: "New comment" };
      const action = {
        type: ADD_COMMENT,
        error: false,
        payload: { comment: newComment },
      };
      const result = articleReducer({}, action);
      expect(result.comments).toEqual([newComment]);
    });
  });

  test.describe("DELETE_COMMENT action", () => {
    test("should delete comment by id", () => {
      const comments = [
        { id: 1, body: "First comment" },
        { id: 2, body: "Second comment" },
        { id: 3, body: "Third comment" },
      ];
      const action = {
        type: DELETE_COMMENT,
        commentId: 2,
      };
      const result = articleReducer({ comments }, action);
      expect(result.comments).toHaveLength(2);
      expect(result.comments.find((c) => c.id === 2)).toBeUndefined();
      expect(result.comments[0].id).toBe(1);
      expect(result.comments[1].id).toBe(3);
    });

    test("should handle deleting first comment", () => {
      const comments = [
        { id: 1, body: "First comment" },
        { id: 2, body: "Second comment" },
      ];
      const action = {
        type: DELETE_COMMENT,
        commentId: 1,
      };
      const result = articleReducer({ comments }, action);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].id).toBe(2);
    });

    test("should handle deleting last comment", () => {
      const comments = [
        { id: 1, body: "First comment" },
        { id: 2, body: "Second comment" },
      ];
      const action = {
        type: DELETE_COMMENT,
        commentId: 2,
      };
      const result = articleReducer({ comments }, action);
      expect(result.comments).toHaveLength(1);
      expect(result.comments[0].id).toBe(1);
    });

    test("should handle deleting non-existent comment", () => {
      const comments = [
        { id: 1, body: "First comment" },
        { id: 2, body: "Second comment" },
      ];
      const action = {
        type: DELETE_COMMENT,
        commentId: 999,
      };
      const result = articleReducer({ comments }, action);
      expect(result.comments).toHaveLength(2);
    });

    test("should handle empty comments array", () => {
      const action = {
        type: DELETE_COMMENT,
        commentId: 1,
      };
      const result = articleReducer({ comments: [] }, action);
      expect(result.comments).toEqual([]);
    });
  });

  test.describe("state immutability", () => {
    test("should not mutate original state on ADD_COMMENT", () => {
      const originalComments = [{ id: 1, body: "First" }];
      const originalState = { comments: originalComments };
      const newComment = { id: 2, body: "Second" };
      const action = {
        type: ADD_COMMENT,
        error: false,
        payload: { comment: newComment },
      };
      articleReducer(originalState, action);
      expect(originalState.comments).toHaveLength(1);
      expect(originalState.comments).toEqual(originalComments);
    });

    test("should not mutate original state on DELETE_COMMENT", () => {
      const originalComments = [
        { id: 1, body: "First" },
        { id: 2, body: "Second" },
      ];
      const originalState = { comments: originalComments };
      const action = {
        type: DELETE_COMMENT,
        commentId: 1,
      };
      articleReducer(originalState, action);
      expect(originalState.comments).toHaveLength(2);
    });
  });

  test.describe("unknown action", () => {
    test("should return current state for unknown action", () => {
      const currentState = { article: { slug: "test" }, comments: [] };
      const action = { type: "UNKNOWN_ACTION" };
      const result = articleReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
