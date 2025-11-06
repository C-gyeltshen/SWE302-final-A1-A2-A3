const { test, expect } = require('@playwright/test');
const commonReducer = require('../../src/reducers/common').default;
const {
  APP_LOAD,
  REDIRECT,
  LOGOUT,
  ARTICLE_SUBMITTED,
  SETTINGS_SAVED,
  LOGIN,
  REGISTER,
  DELETE_ARTICLE,
  ARTICLE_PAGE_UNLOADED,
  EDITOR_PAGE_UNLOADED,
  HOME_PAGE_UNLOADED,
  PROFILE_PAGE_UNLOADED,
  PROFILE_FAVORITES_PAGE_UNLOADED,
  SETTINGS_PAGE_UNLOADED,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
} = require('../../src/constants/actionTypes');

test.describe("common reducer", () => {
  const defaultState = {
    appName: "Conduit",
    token: null,
    viewChangeCounter: 0,
  };

  test("should return default state", () => {
    expect(commonReducer(undefined, {})).toEqual(defaultState);
  });

  test.describe("APP_LOAD action", () => {
    test("should load app with token and user", () => {
      const user = { username: "testuser", email: "test@example.com" };
      const action = {
        type: APP_LOAD,
        token: "test-token-123",
        payload: { user },
      };
      const result = commonReducer(defaultState, action);
      expect(result.token).toBe("test-token-123");
      expect(result.appLoaded).toBe(true);
      expect(result.currentUser).toEqual(user);
      expect(result.appName).toBe("Conduit");
    });

    test("should load app without token", () => {
      const action = {
        type: APP_LOAD,
        token: null,
        payload: null,
      };
      const result = commonReducer(defaultState, action);
      expect(result.token).toBe(null);
      expect(result.appLoaded).toBe(true);
      expect(result.currentUser).toBe(null);
    });

    test("should handle missing payload", () => {
      const action = {
        type: APP_LOAD,
        token: "test-token",
      };
      const result = commonReducer(defaultState, action);
      expect(result.currentUser).toBe(null);
      expect(result.appLoaded).toBe(true);
    });
  });

  test.describe("REDIRECT action", () => {
    test("should clear redirectTo", () => {
      const currentState = {
        ...defaultState,
        redirectTo: "/article/test-slug",
      };
      const result = commonReducer(currentState, { type: REDIRECT });
      expect(result.redirectTo).toBe(null);
    });
  });

  test.describe("LOGOUT action", () => {
    test("should clear user data and redirect to home", () => {
      const currentState = {
        ...defaultState,
        token: "test-token",
        currentUser: { username: "testuser" },
      };
      const result = commonReducer(currentState, { type: LOGOUT });
      expect(result.redirectTo).toBe("/");
      expect(result.token).toBe(null);
      expect(result.currentUser).toBe(null);
    });
  });

  test.describe("ARTICLE_SUBMITTED action", () => {
    test("should redirect to article page on success", () => {
      const action = {
        type: ARTICLE_SUBMITTED,
        error: false,
        payload: { article: { slug: "new-article-slug" } },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe("/article/new-article-slug");
    });

    test("should not redirect on error", () => {
      const action = {
        type: ARTICLE_SUBMITTED,
        error: true,
        payload: { errors: { title: ["can't be blank"] } },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe(null);
    });

    test("should not redirect when payload is missing", () => {
      const action = {
        type: ARTICLE_SUBMITTED,
        error: false,
        payload: null,
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe(null);
    });

    test("should not redirect when article is missing", () => {
      const action = {
        type: ARTICLE_SUBMITTED,
        error: false,
        payload: {},
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe(null);
    });
  });

  test.describe("SETTINGS_SAVED action", () => {
    test("should update user and redirect on success", () => {
      const user = {
        username: "updateduser",
        email: "updated@example.com",
        bio: "Updated bio",
      };
      const action = {
        type: SETTINGS_SAVED,
        error: false,
        payload: { user },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe("/");
      expect(result.currentUser).toEqual(user);
    });

    test("should not redirect on error", () => {
      const action = {
        type: SETTINGS_SAVED,
        error: true,
        payload: { errors: { email: ["is invalid"] } },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe(null);
      expect(result.currentUser).toBe(null);
    });
  });

  test.describe("LOGIN action", () => {
    test("should set token, user and redirect on success", () => {
      const user = {
        username: "testuser",
        email: "test@example.com",
        token: "user-token-123",
      };
      const action = {
        type: LOGIN,
        error: false,
        payload: { user },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe("/");
      expect(result.token).toBe("user-token-123");
      expect(result.currentUser).toEqual(user);
    });

    test("should not set token or redirect on error", () => {
      const action = {
        type: LOGIN,
        error: true,
        payload: { errors: { "email or password": ["is invalid"] } },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe(null);
      expect(result.token).toBe(null);
      expect(result.currentUser).toBe(null);
    });
  });

  test.describe("REGISTER action", () => {
    test("should set token, user and redirect on success", () => {
      const user = {
        username: "newuser",
        email: "newuser@example.com",
        token: "new-token-123",
      };
      const action = {
        type: REGISTER,
        error: false,
        payload: { user },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe("/");
      expect(result.token).toBe("new-token-123");
      expect(result.currentUser).toEqual(user);
    });

    test("should not set token or redirect on error", () => {
      const action = {
        type: REGISTER,
        error: true,
        payload: { errors: { username: ["is already taken"] } },
      };
      const result = commonReducer(defaultState, action);
      expect(result.redirectTo).toBe(null);
      expect(result.token).toBe(null);
      expect(result.currentUser).toBe(null);
    });
  });

  test.describe("DELETE_ARTICLE action", () => {
    test("should redirect to home after deleting article", () => {
      const result = commonReducer(defaultState, { type: DELETE_ARTICLE });
      expect(result.redirectTo).toBe("/");
    });
  });

  test.describe("page unload actions", () => {
    const pageUnloadActions = [
      ARTICLE_PAGE_UNLOADED,
      EDITOR_PAGE_UNLOADED,
      HOME_PAGE_UNLOADED,
      PROFILE_PAGE_UNLOADED,
      PROFILE_FAVORITES_PAGE_UNLOADED,
      SETTINGS_PAGE_UNLOADED,
      LOGIN_PAGE_UNLOADED,
      REGISTER_PAGE_UNLOADED,
    ];

    pageUnloadActions.forEach((actionType) => {
      test(`should increment viewChangeCounter for ${actionType}`, () => {
        const currentState = { ...defaultState, viewChangeCounter: 5 };
        const result = commonReducer(currentState, { type: actionType });
        expect(result.viewChangeCounter).toBe(6);
      });
    });

    test("should increment viewChangeCounter from 0", () => {
      const result = commonReducer(defaultState, { type: HOME_PAGE_UNLOADED });
      expect(result.viewChangeCounter).toBe(1);
    });

    test("should preserve other state when incrementing counter", () => {
      const currentState = {
        ...defaultState,
        token: "test-token",
        currentUser: { username: "testuser" },
        viewChangeCounter: 10,
      };
      const result = commonReducer(currentState, {
        type: ARTICLE_PAGE_UNLOADED,
      });
      expect(result.viewChangeCounter).toBe(11);
      expect(result.token).toBe("test-token");
      expect(result.currentUser).toEqual({ username: "testuser" });
    });
  });

  test.describe("state immutability", () => {
    test("should not mutate original state", () => {
      const originalState = { ...defaultState };
      const action = {
        type: APP_LOAD,
        token: "test-token",
        payload: { user: { username: "testuser" } },
      };
      commonReducer(originalState, action);
      expect(originalState).toEqual(defaultState);
    });
  });

  test.describe("unknown action", () => {
    test("should return current state for unknown action", () => {
      const currentState = { ...defaultState, token: "test-token" };
      const action = { type: "UNKNOWN_ACTION" };
      const result = commonReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
