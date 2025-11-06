const { test, expect } = require('@playwright/test');
const authReducer = require('../../src/reducers/auth').default;
const {
  LOGIN,
  REGISTER,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH,
} = require('../../src/constants/actionTypes');

test.describe("auth reducer", () => {
  test("should return initial state", () => {
    expect(authReducer(undefined, {})).toEqual({});
  });

  test.describe("LOGIN action", () => {
    test("should handle successful LOGIN", () => {
      const action = {
        type: LOGIN,
        error: false,
        payload: { user: { token: "test-token" } },
      };
      const result = authReducer({}, action);
      expect(result).toEqual({
        inProgress: false,
        errors: null,
      });
    });

    test("should handle LOGIN with errors", () => {
      const errors = { email: ["is invalid"] };
      const action = {
        type: LOGIN,
        error: true,
        payload: { errors },
      };
      const result = authReducer({}, action);
      expect(result).toEqual({
        inProgress: false,
        errors,
      });
    });

    test("should handle LOGIN error without payload", () => {
      const action = {
        type: LOGIN,
        error: true,
      };
      const result = authReducer({}, action);
      expect(result).toEqual({
        inProgress: false,
        errors: null,
      });
    });
  });

  test.describe("REGISTER action", () => {
    test("should handle successful REGISTER", () => {
      const action = {
        type: REGISTER,
        error: false,
        payload: { user: { token: "test-token" } },
      };
      const result = authReducer({}, action);
      expect(result).toEqual({
        inProgress: false,
        errors: null,
      });
    });

    test("should handle REGISTER with errors", () => {
      const errors = { username: ["is already taken"] };
      const action = {
        type: REGISTER,
        error: true,
        payload: { errors },
      };
      const result = authReducer({}, action);
      expect(result).toEqual({
        inProgress: false,
        errors,
      });
    });
  });

  test.describe("LOGIN_PAGE_UNLOADED action", () => {
    test("should reset state when LOGIN_PAGE_UNLOADED", () => {
      const currentState = {
        email: "test@example.com",
        password: "password",
        inProgress: true,
      };
      const result = authReducer(currentState, { type: LOGIN_PAGE_UNLOADED });
      expect(result).toEqual({});
    });
  });

  test.describe("REGISTER_PAGE_UNLOADED action", () => {
    test("should reset state when REGISTER_PAGE_UNLOADED", () => {
      const currentState = {
        username: "testuser",
        email: "test@example.com",
        password: "password",
        inProgress: false,
      };
      const result = authReducer(currentState, {
        type: REGISTER_PAGE_UNLOADED,
      });
      expect(result).toEqual({});
    });
  });

  test.describe("ASYNC_START action", () => {
    test("should set inProgress true for LOGIN subtype", () => {
      const action = {
        type: ASYNC_START,
        subtype: LOGIN,
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ inProgress: true });
    });

    test("should set inProgress true for REGISTER subtype", () => {
      const action = {
        type: ASYNC_START,
        subtype: REGISTER,
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ inProgress: true });
    });

    test("should not modify state for other subtypes", () => {
      const currentState = { email: "test@example.com" };
      const action = {
        type: ASYNC_START,
        subtype: "SOMETHING_ELSE",
      };
      const result = authReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });

  test.describe("UPDATE_FIELD_AUTH action", () => {
    test("should update email field", () => {
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "email",
        value: "test@example.com",
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ email: "test@example.com" });
    });

    test("should update password field", () => {
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "password",
        value: "secretpassword",
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ password: "secretpassword" });
    });

    test("should update username field", () => {
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "username",
        value: "johndoe",
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ username: "johndoe" });
    });

    test("should merge with existing state", () => {
      const currentState = { email: "test@example.com" };
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "password",
        value: "newpassword",
      };
      const result = authReducer(currentState, action);
      expect(result).toEqual({
        email: "test@example.com",
        password: "newpassword",
      });
    });
  });

  test.describe("state immutability", () => {
    test("should not mutate original state", () => {
      const originalState = { email: "test@example.com" };
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "password",
        value: "password",
      };
      authReducer(originalState, action);
      expect(originalState).toEqual({ email: "test@example.com" });
    });
  });

  test.describe("unknown action", () => {
    test("should return current state for unknown action type", () => {
      const currentState = { email: "test@example.com" };
      const action = { type: "UNKNOWN_ACTION" };
      const result = authReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
