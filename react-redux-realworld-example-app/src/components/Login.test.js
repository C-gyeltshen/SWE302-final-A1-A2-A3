import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import Login from "./Login";
import {
  LOGIN,
  UPDATE_FIELD_AUTH,
  LOGIN_PAGE_UNLOADED,
} from "../constants/actionTypes";

const mockStore = configureStore([]);

describe("Login Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        email: "",
        password: "",
        inProgress: false,
        errors: null,
      },
    });
    store.dispatch = jest.fn();
  });

  const renderLogin = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  test("should render login form correctly", () => {
    renderLogin();

    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Need an account?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test("should display link to register page", () => {
    renderLogin();

    const registerLink = screen.getByText("Need an account?");
    expect(registerLink.closest("a")).toHaveAttribute("href", "/register");
  });

  test("should update email field when user types", () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: UPDATE_FIELD_AUTH,
      key: "email",
      value: "test@example.com",
    });
  });

  test("should update password field when user types", () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: UPDATE_FIELD_AUTH,
      key: "password",
      value: "password123",
    });
  });

  test("should dispatch LOGIN action on form submit", () => {
    store = mockStore({
      auth: {
        email: "test@example.com",
        password: "password123",
        inProgress: false,
        errors: null,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const form = screen
      .getByRole("button", { name: /sign in/i })
      .closest("form");
    fireEvent.submit(form);

    expect(store.dispatch).toHaveBeenCalled();
  });

  test("should disable submit button when inProgress is true", () => {
    store = mockStore({
      auth: {
        email: "test@example.com",
        password: "password123",
        inProgress: true,
        errors: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  test("should display errors when present", () => {
    store = mockStore({
      auth: {
        email: "",
        password: "",
        inProgress: false,
        errors: {
          "email or password": ["is invalid"],
        },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    expect(
      screen.getByText(/email or password is invalid/i)
    ).toBeInTheDocument();
  });

  test("should dispatch LOGIN_PAGE_UNLOADED on unmount", () => {
    const { unmount } = renderLogin();

    unmount();

    const actions = store.getActions();
    expect(actions).toContainEqual({ type: LOGIN_PAGE_UNLOADED });
  });

  test("should have email input with correct type", () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText("Email");
    expect(emailInput).toHaveAttribute("type", "email");
  });

  test("should have password input with correct type", () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
