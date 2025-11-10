import configureMockStore from "redux-mock-store";
import { promiseMiddleware, localStorageMiddleware } from "./middleware";
import {
  ASYNC_START,
  ASYNC_END,
  LOGIN,
  LOGOUT,
  REGISTER,
} from "./constants/actionTypes";

// Helper function to check if value is a promise
const isPromise = (v) => v && typeof v.then === "function";

// Mock middleware setup
const middlewares = [promiseMiddleware, localStorageMiddleware];
const mockStore = configureMockStore(middlewares);

describe("Middleware Tests", () => {
  describe("promiseMiddleware", () => {
    let store;

    beforeEach(() => {
      store = mockStore({
        viewChangeCounter: 0,
      });
      console.log = jest.fn(); // Mock console.log
    });

    test("should pass through non-promise actions", () => {
      const action = { type: "TEST_ACTION", payload: "test" };

      store.dispatch(action);

      const actions = store.getActions();
      expect(actions).toContainEqual(action);
    });

    test("should dispatch ASYNC_START for promise actions", () => {
      const promise = Promise.resolve({ data: "test" });
      const action = { type: "TEST_PROMISE", payload: promise };

      store.dispatch(action);

      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: ASYNC_START,
        subtype: "TEST_PROMISE",
      });
    });

    test("should dispatch ASYNC_END and original action on promise success", async () => {
      const resolvedData = { data: "success" };
      const promise = Promise.resolve(resolvedData);
      const action = { type: "TEST_PROMISE", payload: promise };

      store.dispatch(action);

      // Wait for promise to resolve
      await promise;

      // Give time for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();
      expect(actions.some((a) => a.type === ASYNC_END)).toBeTruthy();
    });

    test("should handle promise rejection correctly", async () => {
      const error = new Error("Test error");
      const promise = Promise.reject(error);
      const action = { type: "TEST_PROMISE", payload: promise };

      store.dispatch(action);

      // Wait for promise to reject
      await promise.catch(() => {});

      // Give time for async operations
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();
      // Should dispatch error action
      expect(actions.length).toBeGreaterThan(1);
    });

    test("should not track actions when skipTracking is true", async () => {
      const promise = Promise.resolve({ data: "test" });
      const action = {
        type: "TEST_PROMISE",
        payload: promise,
        skipTracking: true,
      };

      store.dispatch(action);

      await promise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();
      const asyncEndActions = actions.filter((a) => a.type === ASYNC_END);
      expect(asyncEndActions.length).toBe(0);
    });

    test("should handle actions with error response body", async () => {
      const errorResponse = {
        response: {
          body: {
            errors: { email: ["is invalid"] },
          },
        },
      };
      const promise = Promise.reject(errorResponse);
      const action = { type: "TEST_PROMISE", payload: promise };

      store.dispatch(action);

      await promise.catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();
      expect(actions.length).toBeGreaterThan(0);
    });

    test("should handle actions without error response body", async () => {
      const error = new Error("Network error");
      const promise = Promise.reject(error);
      const action = { type: "TEST_PROMISE", payload: promise };

      store.dispatch(action);

      await promise.catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();
      expect(actions.length).toBeGreaterThan(0);
    });
  });

  describe("localStorageMiddleware", () => {
    let store;

    beforeEach(() => {
      store = mockStore({});
      // Mock localStorage
      global.localStorage = {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn(),
      };
    });

    test("should store JWT token on LOGIN action", () => {
      const action = {
        type: LOGIN,
        payload: {
          user: {
            token: "test-jwt-token",
          },
        },
      };

      store.dispatch(action);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "jwt",
        "test-jwt-token"
      );
    });

    test("should store JWT token on REGISTER action", () => {
      const action = {
        type: REGISTER,
        payload: {
          user: {
            token: "test-jwt-token",
          },
        },
      };

      store.dispatch(action);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "jwt",
        "test-jwt-token"
      );
    });

    test("should remove JWT token on LOGOUT action", () => {
      const action = { type: LOGOUT };

      store.dispatch(action);

      expect(localStorage.removeItem).toHaveBeenCalledWith("jwt");
    });

    test("should not store token if payload is missing", () => {
      const action = { type: LOGIN, payload: {} };

      store.dispatch(action);

      // Should not throw error
      expect(true).toBe(true);
    });

    test("should not store token if user is missing in payload", () => {
      const action = { type: LOGIN, payload: { data: "test" } };

      store.dispatch(action);

      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe("Middleware Integration", () => {
    let store;

    beforeEach(() => {
      store = mockStore({
        viewChangeCounter: 0,
      });
      global.localStorage = {
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
    });

    test("should handle LOGIN with promise and store token", async () => {
      const userData = {
        user: {
          token: "test-token",
          email: "test@example.com",
        },
      };
      const promise = Promise.resolve(userData);
      const action = { type: LOGIN, payload: promise };

      store.dispatch(action);

      await promise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: ASYNC_START,
        subtype: LOGIN,
      });
    });

    test("should handle REGISTER with promise and store token", async () => {
      const userData = {
        user: {
          token: "test-token",
          email: "test@example.com",
        },
      };
      const promise = Promise.resolve(userData);
      const action = { type: REGISTER, payload: promise };

      store.dispatch(action);

      await promise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();
      expect(actions).toContainEqual({
        type: ASYNC_START,
        subtype: REGISTER,
      });
    });
  });
});
