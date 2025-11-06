import homeReducer from "./home";
import { HOME_PAGE_LOADED, HOME_PAGE_UNLOADED } from "../constants/actionTypes";

describe("home reducer", () => {
  it("should return initial state", () => {
    expect(homeReducer(undefined, {})).toEqual({});
  });

  describe("HOME_PAGE_LOADED action", () => {
    it("should load tags", () => {
      const tags = ["react", "javascript", "nodejs", "angular"];
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [{ tags }, { articles: [], articlesCount: 0 }],
      };
      const result = homeReducer({}, action);
      expect(result.tags).toEqual(tags);
    });

    it("should handle empty tags", () => {
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [{ tags: [] }, { articles: [], articlesCount: 0 }],
      };
      const result = homeReducer({}, action);
      expect(result.tags).toEqual([]);
    });

    it("should handle missing payload", () => {
      const action = {
        type: HOME_PAGE_LOADED,
        payload: null,
      };
      const result = homeReducer({}, action);
      expect(result.tags).toEqual([]);
    });

    it("should handle missing tags in payload", () => {
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [null, { articles: [], articlesCount: 0 }],
      };
      const result = homeReducer({}, action);
      expect(result.tags).toEqual([]);
    });

    it("should handle undefined tags in payload", () => {
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [{}, { articles: [], articlesCount: 0 }],
      };
      const result = homeReducer({}, action);
      expect(result.tags).toEqual([]);
    });

    it("should merge with existing state", () => {
      const currentState = { otherProperty: "value" };
      const tags = ["react", "javascript"];
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [{ tags }, { articles: [], articlesCount: 0 }],
      };
      const result = homeReducer(currentState, action);
      expect(result.tags).toEqual(tags);
      expect(result.otherProperty).toBe("value");
    });
  });

  describe("HOME_PAGE_UNLOADED action", () => {
    it("should reset state when home page unloaded", () => {
      const currentState = {
        tags: ["react", "javascript", "nodejs"],
      };
      const result = homeReducer(currentState, { type: HOME_PAGE_UNLOADED });
      expect(result).toEqual({});
    });

    it("should reset state with multiple properties", () => {
      const currentState = {
        tags: ["react"],
        otherProperty: "value",
      };
      const result = homeReducer(currentState, { type: HOME_PAGE_UNLOADED });
      expect(result).toEqual({});
    });
  });

  describe("state immutability", () => {
    it("should not mutate original state", () => {
      const originalTags = ["react", "javascript"];
      const originalState = { tags: originalTags };
      const action = {
        type: HOME_PAGE_LOADED,
        payload: [
          { tags: ["nodejs", "python"] },
          { articles: [], articlesCount: 0 },
        ],
      };
      homeReducer(originalState, action);
      expect(originalState.tags).toEqual(["react", "javascript"]);
    });
  });

  describe("unknown action", () => {
    it("should return current state for unknown action", () => {
      const currentState = { tags: ["react", "javascript"] };
      const action = { type: "UNKNOWN_ACTION" };
      const result = homeReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
