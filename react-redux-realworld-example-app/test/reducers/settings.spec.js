const { test, expect } = require('@playwright/test');
const settingsReducer = require('../../src/reducers/settings').default;
const {
  SETTINGS_SAVED,
  SETTINGS_PAGE_UNLOADED,
  ASYNC_START,
} = require('../../src/constants/actionTypes');

test.describe("settings reducer", () => {
  test("should return initial state", () => {
    expect(settingsReducer(undefined, {})).toEqual({});
  });

  test.describe("SETTINGS_SAVED action", () => {
    test("should handle successful settings save", () => {
      const currentState = { inProgress: true };
      const action = {
        type: SETTINGS_SAVED,
        error: false,
        payload: { user: { username: "testuser" } },
      };
      const result = settingsReducer(currentState, action);
      expect(result).toEqual({
        inProgress: false,
        errors: null,
      });
    });

    test("should handle settings save with errors", () => {
      const errors = {
        email: ["is invalid"],
        password: ["is too short"],
      };
      const action = {
        type: SETTINGS_SAVED,
        error: true,
        payload: { errors },
      };
      const result = settingsReducer({}, action);
      expect(result).toEqual({
        inProgress: false,
        errors,
      });
    });

    test("should clear inProgress flag on success", () => {
      const currentState = { inProgress: true, someField: "value" };
      const action = {
        type: SETTINGS_SAVED,
        error: false,
        payload: { user: {} },
      };
      const result = settingsReducer(currentState, action);
      expect(result.inProgress).toBe(false);
      expect(result.errors).toBe(null);
    });
  });

  test.describe("SETTINGS_PAGE_UNLOADED action", () => {
    test("should reset state when settings page unloaded", () => {
      const currentState = {
        inProgress: false,
        errors: null,
        image: "https://example.com/avatar.jpg",
        username: "testuser",
        bio: "Test bio",
        email: "test@example.com",
      };
      const result = settingsReducer(currentState, {
        type: SETTINGS_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });

    test("should reset state with errors", () => {
      const currentState = {
        inProgress: false,
        errors: { email: ["is invalid"] },
      };
      const result = settingsReducer(currentState, {
        type: SETTINGS_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  test.describe("ASYNC_START action", () => {
    test("should set inProgress to true", () => {
      const action = { type: ASYNC_START };
      const result = settingsReducer({}, action);
      expect(result).toEqual({ inProgress: true });
    });

    test("should update inProgress in existing state", () => {
      const currentState = {
        username: "testuser",
        email: "test@example.com",
        inProgress: false,
      };
      const action = { type: ASYNC_START };
      const result = settingsReducer(currentState, action);
      expect(result.inProgress).toBe(true);
      expect(result.username).toBe("testuser");
      expect(result.email).toBe("test@example.com");
    });

    test("should preserve existing fields when setting inProgress", () => {
      const currentState = {
        image: "https://example.com/avatar.jpg",
        bio: "My bio",
      };
      const action = { type: ASYNC_START };
      const result = settingsReducer(currentState, action);
      expect(result).toEqual({
        image: "https://example.com/avatar.jpg",
        bio: "My bio",
        inProgress: true,
      });
    });
  });

  test.describe("state immutability", () => {
    test("should not mutate original state on ASYNC_START", () => {
      const originalState = { username: "testuser", inProgress: false };
      settingsReducer(originalState, { type: ASYNC_START });
      expect(originalState.inProgress).toBe(false);
    });

    test("should not mutate original state on SETTINGS_SAVED", () => {
      const originalState = { inProgress: true };
      const action = {
        type: SETTINGS_SAVED,
        error: false,
        payload: { user: {} },
      };
      settingsReducer(originalState, action);
      expect(originalState.inProgress).toBe(true);
    });
  });

  test.describe("unknown action", () => {
    test("should return current state for unknown action", () => {
      const currentState = {
        username: "testuser",
        email: "test@example.com",
      };
      const action = { type: "UNKNOWN_ACTION" };
      const result = settingsReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });

  test.describe("error handling", () => {
    test("should handle multiple errors", () => {
      const errors = {
        username: ["is already taken", "is too short"],
        email: ["is invalid"],
        password: ["is too short", "must contain special characters"],
      };
      const action = {
        type: SETTINGS_SAVED,
        error: true,
        payload: { errors },
      };
      const result = settingsReducer({}, action);
      expect(result.errors).toEqual(errors);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });
});
