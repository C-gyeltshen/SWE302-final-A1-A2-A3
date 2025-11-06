import authReducer from "./auth";
import {
  LOGIN,
  REGISTER,
  LOGIN_PAGE_UNLOADED,
  REGISTER_PAGE_UNLOADED,
  ASYNC_START,
  UPDATE_FIELD_AUTH,
} from "../constants/actionTypes";

describe("auth reducer", () => {
  it("should return initial state", () => {
    expect(authReducer(undefined, {})).toEqual({});
  });

  describe("LOGIN action", () => {
    it("should handle successful LOGIN", () => {
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

    it("should handle LOGIN with errors", () => {
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

    it("should handle LOGIN error without payload", () => {
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

  describe("REGISTER action", () => {
    it("should handle successful REGISTER", () => {
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

    it("should handle REGISTER with errors", () => {
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

  describe("LOGIN_PAGE_UNLOADED action", () => {
    it("should reset state when LOGIN_PAGE_UNLOADED", () => {
      const currentState = {
        email: "test@example.com",
        password: "password",
        inProgress: true,
      };
      const result = authReducer(currentState, { type: LOGIN_PAGE_UNLOADED });
      expect(result).toEqual({});
    });
  });

  describe("REGISTER_PAGE_UNLOADED action", () => {
    it("should reset state when REGISTER_PAGE_UNLOADED", () => {
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

  describe("ASYNC_START action", () => {
    it("should set inProgress true for LOGIN subtype", () => {
      const action = {
        type: ASYNC_START,
        subtype: LOGIN,
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ inProgress: true });
    });

    it("should set inProgress true for REGISTER subtype", () => {
      const action = {
        type: ASYNC_START,
        subtype: REGISTER,
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ inProgress: true });
    });

    it("should not modify state for other subtypes", () => {
      const currentState = { email: "test@example.com" };
      const action = {
        type: ASYNC_START,
        subtype: "SOMETHING_ELSE",
      };
      const result = authReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });

  describe("UPDATE_FIELD_AUTH action", () => {
    it("should update email field", () => {
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "email",
        value: "test@example.com",
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ email: "test@example.com" });
    });

    it("should update password field", () => {
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "password",
        value: "secretpassword",
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ password: "secretpassword" });
    });

    it("should update username field", () => {
      const action = {
        type: UPDATE_FIELD_AUTH,
        key: "username",
        value: "johndoe",
      };
      const result = authReducer({}, action);
      expect(result).toEqual({ username: "johndoe" });
    });

    it("should merge with existing state", () => {
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

  describe("state immutability", () => {
    it("should not mutate original state", () => {
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

  describe("unknown action", () => {
    it("should return current state for unknown action type", () => {
      const currentState = { email: "test@example.com" };
      const action = { type: "UNKNOWN_ACTION" };
      const result = authReducer(currentState, action);
      expect(result).toEqual(currentState);
    });
  });
});
