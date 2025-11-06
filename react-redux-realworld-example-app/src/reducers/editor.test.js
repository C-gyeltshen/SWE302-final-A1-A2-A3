import editorReducer from "./editor";
import {
  EDITOR_PAGE_LOADED,
  EDITOR_PAGE_UNLOADED,
  ARTICLE_SUBMITTED,
  ASYNC_START,
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR,
} from "../constants/actionTypes";

describe("editor reducer", () => {
  it("should return initial state", () => {
    expect(editorReducer(undefined, {})).toEqual({});
  });

  describe("EDITOR_PAGE_LOADED action", () => {
    it("should load article for editing", () => {
      const article = {
        slug: "test-article",
        title: "Test Article",
        description: "Test description",
        body: "Article body content",
        tagList: ["react", "javascript"],
      };
      const action = {
        type: EDITOR_PAGE_LOADED,
        payload: { article },
      };
      const result = editorReducer({}, action);
      expect(result).toEqual({
        articleSlug: "test-article",
        title: "Test Article",
        description: "Test description",
        body: "Article body content",
        tagInput: "",
        tagList: ["react", "javascript"],
      });
    });

    it("should initialize empty form for new article", () => {
      const action = {
        type: EDITOR_PAGE_LOADED,
        payload: null,
      };
      const result = editorReducer({}, action);
      expect(result).toEqual({
        articleSlug: "",
        title: "",
        description: "",
        body: "",
        tagInput: "",
        tagList: [],
      });
    });

    it("should handle missing tagList", () => {
      const article = {
        slug: "test",
        title: "Test",
        description: "Desc",
        body: "Body",
      };
      const action = {
        type: EDITOR_PAGE_LOADED,
        payload: { article },
      };
      const result = editorReducer({}, action);
      expect(result.tagList).toBeUndefined();
    });
  });

  describe("EDITOR_PAGE_UNLOADED action", () => {
    it("should reset state when editor page unloaded", () => {
      const currentState = {
        title: "My Article",
        description: "Article description",
        body: "Article body",
        tagList: ["react"],
      };
      const result = editorReducer(currentState, {
        type: EDITOR_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  describe("ARTICLE_SUBMITTED action", () => {
    it("should clear inProgress and errors on success", () => {
      const currentState = { inProgress: true, title: "Test" };
      const action = {
        type: ARTICLE_SUBMITTED,
        error: false,
        payload: { article: { slug: "test-article" } },
      };
      const result = editorReducer(currentState, action);
      expect(result.inProgress).toBe(null);
      expect(result.errors).toBe(null);
    });

    it("should set errors on failure", () => {
      const errors = {
        title: ["can't be blank"],
        body: ["can't be blank"],
      };
      const action = {
        type: ARTICLE_SUBMITTED,
        error: true,
        payload: { errors },
      };
      const result = editorReducer({}, action);
      expect(result.inProgress).toBe(null);
      expect(result.errors).toEqual(errors);
    });
  });

  describe("ASYNC_START action", () => {
    it("should set inProgress for ARTICLE_SUBMITTED subtype", () => {
      const action = {
        type: ASYNC_START,
        subtype: ARTICLE_SUBMITTED,
      };
      const result = editorReducer({}, action);
      expect(result.inProgress).toBe(true);
    });

    it("should not modify state for other subtypes", () => {
      const currentState = { title: "Test Article" };
      const action = {
        type: ASYNC_START,
        subtype: "OTHER_ACTION",
      };
      const result = editorReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });

  describe("ADD_TAG action", () => {
    it("should add tag from tagInput", () => {
      const currentState = {
        tagList: ["react", "javascript"],
        tagInput: "nodejs",
      };
      const action = { type: ADD_TAG };
      const result = editorReducer(currentState, action);
      expect(result.tagList).toEqual(["react", "javascript", "nodejs"]);
      expect(result.tagInput).toBe("");
    });

    it("should add tag to empty list", () => {
      const currentState = {
        tagList: [],
        tagInput: "react",
      };
      const action = { type: ADD_TAG };
      const result = editorReducer(currentState, action);
      expect(result.tagList).toEqual(["react"]);
      expect(result.tagInput).toBe("");
    });

    it("should clear tagInput after adding", () => {
      const currentState = {
        tagList: ["react"],
        tagInput: "redux",
      };
      const action = { type: ADD_TAG };
      const result = editorReducer(currentState, action);
      expect(result.tagInput).toBe("");
    });
  });

  describe("REMOVE_TAG action", () => {
    it("should remove tag from list", () => {
      const currentState = {
        tagList: ["react", "javascript", "nodejs"],
      };
      const action = {
        type: REMOVE_TAG,
        tag: "javascript",
      };
      const result = editorReducer(currentState, action);
      expect(result.tagList).toEqual(["react", "nodejs"]);
    });

    it("should remove first tag", () => {
      const currentState = {
        tagList: ["react", "javascript", "nodejs"],
      };
      const action = {
        type: REMOVE_TAG,
        tag: "react",
      };
      const result = editorReducer(currentState, action);
      expect(result.tagList).toEqual(["javascript", "nodejs"]);
    });

    it("should remove last tag", () => {
      const currentState = {
        tagList: ["react", "javascript", "nodejs"],
      };
      const action = {
        type: REMOVE_TAG,
        tag: "nodejs",
      };
      const result = editorReducer(currentState, action);
      expect(result.tagList).toEqual(["react", "javascript"]);
    });

    it("should handle removing non-existent tag", () => {
      const currentState = {
        tagList: ["react", "javascript"],
      };
      const action = {
        type: REMOVE_TAG,
        tag: "python",
      };
      const result = editorReducer(currentState, action);
      expect(result.tagList).toEqual(["react", "javascript"]);
    });

    it("should handle empty tag list", () => {
      const currentState = {
        tagList: [],
      };
      const action = {
        type: REMOVE_TAG,
        tag: "react",
      };
      const result = editorReducer(currentState, action);
      expect(result.tagList).toEqual([]);
    });
  });

  describe("UPDATE_FIELD_EDITOR action", () => {
    it("should update title field", () => {
      const action = {
        type: UPDATE_FIELD_EDITOR,
        key: "title",
        value: "New Article Title",
      };
      const result = editorReducer({}, action);
      expect(result.title).toBe("New Article Title");
    });

    it("should update description field", () => {
      const action = {
        type: UPDATE_FIELD_EDITOR,
        key: "description",
        value: "Article description",
      };
      const result = editorReducer({}, action);
      expect(result.description).toBe("Article description");
    });

    it("should update body field", () => {
      const action = {
        type: UPDATE_FIELD_EDITOR,
        key: "body",
        value: "Article body content",
      };
      const result = editorReducer({}, action);
      expect(result.body).toBe("Article body content");
    });

    it("should update tagInput field", () => {
      const action = {
        type: UPDATE_FIELD_EDITOR,
        key: "tagInput",
        value: "react",
      };
      const result = editorReducer({}, action);
      expect(result.tagInput).toBe("react");
    });

    it("should merge with existing state", () => {
      const currentState = {
        title: "Existing Title",
        description: "Existing Description",
      };
      const action = {
        type: UPDATE_FIELD_EDITOR,
        key: "body",
        value: "New Body",
      };
      const result = editorReducer(currentState, action);
      expect(result.title).toBe("Existing Title");
      expect(result.description).toBe("Existing Description");
      expect(result.body).toBe("New Body");
    });
  });

  describe("state immutability", () => {
    it("should not mutate original state on ADD_TAG", () => {
      const originalTagList = ["react", "javascript"];
      const originalState = { tagList: originalTagList, tagInput: "nodejs" };
      editorReducer(originalState, { type: ADD_TAG });
      expect(originalState.tagList).toEqual(["react", "javascript"]);
    });

    it("should not mutate original state on REMOVE_TAG", () => {
      const originalTagList = ["react", "javascript", "nodejs"];
      const originalState = { tagList: originalTagList };
      editorReducer(originalState, { type: REMOVE_TAG, tag: "javascript" });
      expect(originalState.tagList).toEqual(["react", "javascript", "nodejs"]);
    });
  });

  describe("unknown action", () => {
    it("should return current state for unknown action", () => {
      const currentState = { title: "Test", body: "Content" };
      const action = { type: "UNKNOWN_ACTION" };
      const result = editorReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
