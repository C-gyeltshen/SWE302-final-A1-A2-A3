import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";
import Editor from "./Editor";
import {
  ADD_TAG,
  REMOVE_TAG,
  UPDATE_FIELD_EDITOR,
  ARTICLE_SUBMITTED,
  EDITOR_PAGE_UNLOADED,
} from "../constants/actionTypes";

const mockStore = configureStore([]);

describe("Editor Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      editor: {
        title: "",
        description: "",
        body: "",
        tagInput: "",
        tagList: [],
        inProgress: false,
        errors: null,
      },
    });
    store.dispatch = jest.fn();
  });

  const renderEditor = (initialEntries = ["/editor"]) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Route
            path="/editor/:slug?"
            render={(props) => <Editor {...props} />}
          />
        </BrowserRouter>
      </Provider>
    );
  };

  test("should render editor form correctly", () => {
    renderEditor();

    expect(screen.getByPlaceholderText("Article Title")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What's this article about?")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your article (in markdown)")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter tags")).toBeInTheDocument();
    expect(screen.getByText("Publish Article")).toBeInTheDocument();
  });

  test("should update title field when user types", () => {
    renderEditor();

    const titleInput = screen.getByPlaceholderText("Article Title");
    fireEvent.change(titleInput, { target: { value: "Test Article" } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: UPDATE_FIELD_EDITOR,
      key: "title",
      value: "Test Article",
    });
  });

  test("should update description field when user types", () => {
    renderEditor();

    const descriptionInput = screen.getByPlaceholderText(
      "What's this article about?"
    );
    fireEvent.change(descriptionInput, {
      target: { value: "Test Description" },
    });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: UPDATE_FIELD_EDITOR,
      key: "description",
      value: "Test Description",
    });
  });

  test("should update body field when user types", () => {
    renderEditor();

    const bodyInput = screen.getByPlaceholderText(
      "Write your article (in markdown)"
    );
    fireEvent.change(bodyInput, { target: { value: "Test Body Content" } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: UPDATE_FIELD_EDITOR,
      key: "body",
      value: "Test Body Content",
    });
  });

  test("should update tag input field when user types", () => {
    renderEditor();

    const tagInput = screen.getByPlaceholderText("Enter tags");
    fireEvent.change(tagInput, { target: { value: "react" } });

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: UPDATE_FIELD_EDITOR,
      key: "tagInput",
      value: "react",
    });
  });

  test("should add tag when Enter key is pressed", () => {
    renderEditor();

    const tagInput = screen.getByPlaceholderText("Enter tags");
    fireEvent.keyUp(tagInput, { keyCode: 13 });

    const actions = store.getActions();
    expect(actions).toContainEqual({ type: ADD_TAG });
  });

  test("should display existing tags", () => {
    store = mockStore({
      editor: {
        title: "",
        description: "",
        body: "",
        tagInput: "",
        tagList: ["react", "redux", "testing"],
        inProgress: false,
        errors: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route
            path="/editor/:slug?"
            render={(props) => <Editor {...props} />}
          />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("redux")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
  });

  test("should remove tag when close icon is clicked", () => {
    store = mockStore({
      editor: {
        title: "",
        description: "",
        body: "",
        tagInput: "",
        tagList: ["react", "redux"],
        inProgress: false,
        errors: null,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route
            path="/editor/:slug?"
            render={(props) => <Editor {...props} />}
          />
        </BrowserRouter>
      </Provider>
    );

    const closeIcons = screen.getAllByClassName("ion-close-round");
    fireEvent.click(closeIcons[0]);

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: REMOVE_TAG,
      tag: "react",
    });
  });

  test("should disable publish button when inProgress is true", () => {
    store = mockStore({
      editor: {
        title: "Test",
        description: "Test",
        body: "Test",
        tagInput: "",
        tagList: [],
        inProgress: true,
        errors: null,
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route
            path="/editor/:slug?"
            render={(props) => <Editor {...props} />}
          />
        </BrowserRouter>
      </Provider>
    );

    const publishButton = screen.getByText("Publish Article");
    expect(publishButton).toBeDisabled();
  });

  test("should submit article when publish button is clicked", () => {
    store = mockStore({
      editor: {
        title: "Test Article",
        description: "Test Description",
        body: "Test Body",
        tagInput: "",
        tagList: ["react"],
        inProgress: false,
        errors: null,
      },
    });
    store.dispatch = jest.fn();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route
            path="/editor/:slug?"
            render={(props) => <Editor {...props} />}
          />
        </BrowserRouter>
      </Provider>
    );

    const publishButton = screen.getByText("Publish Article");
    fireEvent.click(publishButton);

    expect(store.dispatch).toHaveBeenCalled();
  });

  test("should display errors when present", () => {
    store = mockStore({
      editor: {
        title: "",
        description: "",
        body: "",
        tagInput: "",
        tagList: [],
        inProgress: false,
        errors: {
          title: ["can't be blank"],
        },
      },
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route
            path="/editor/:slug?"
            render={(props) => <Editor {...props} />}
          />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/title can't be blank/i)).toBeInTheDocument();
  });

  test("should dispatch EDITOR_PAGE_UNLOADED on unmount", () => {
    const { unmount } = renderEditor();

    unmount();

    const actions = store.getActions();
    expect(actions).toContainEqual({ type: EDITOR_PAGE_UNLOADED });
  });

  test("should have textarea for body input", () => {
    renderEditor();

    const bodyInput = screen.getByPlaceholderText(
      "Write your article (in markdown)"
    );
    expect(bodyInput.tagName).toBe("TEXTAREA");
  });

  test("should render all form fields with correct types", () => {
    renderEditor();

    const titleInput = screen.getByPlaceholderText("Article Title");
    const descriptionInput = screen.getByPlaceholderText(
      "What's this article about?"
    );
    const tagInput = screen.getByPlaceholderText("Enter tags");

    expect(titleInput).toHaveAttribute("type", "text");
    expect(descriptionInput).toHaveAttribute("type", "text");
    expect(tagInput).toHaveAttribute("type", "text");
  });
});
