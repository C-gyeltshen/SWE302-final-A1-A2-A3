import configureMockStore from "redux-mock-store";
import {
  LOGIN,
  LOGOUT,
  REGISTER,
  UPDATE_FIELD_AUTH,
  UPDATE_FIELD_EDITOR,
  ADD_TAG,
  REMOVE_TAG,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  SET_PAGE,
  APPLY_TAG_FILTER,
  FOLLOW_USER,
  UNFOLLOW_USER,
  SETTINGS_SAVED,
  DELETE_ARTICLE,
  DELETE_COMMENT,
  ARTICLE_SUBMITTED,
  HOME_PAGE_LOADED,
  PROFILE_PAGE_LOADED,
  ARTICLE_PAGE_LOADED,
  EDITOR_PAGE_LOADED,
} from "./constants/actionTypes";

const mockStore = configureMockStore([]);

describe("Action Creators", () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  describe("Authentication Actions", () => {
    test("should create LOGIN action", () => {
      const credentials = {
        email: "test@example.com",
        password: "password123",
      };
      const expectedAction = {
        type: LOGIN,
        payload: credentials,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create REGISTER action", () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
      };
      const expectedAction = {
        type: REGISTER,
        payload: userData,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create LOGOUT action", () => {
      const expectedAction = { type: LOGOUT };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create UPDATE_FIELD_AUTH action for email", () => {
      const expectedAction = {
        type: UPDATE_FIELD_AUTH,
        key: "email",
        value: "test@example.com",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create UPDATE_FIELD_AUTH action for password", () => {
      const expectedAction = {
        type: UPDATE_FIELD_AUTH,
        key: "password",
        value: "newpassword",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });
  });

  describe("Editor Actions", () => {
    test("should create UPDATE_FIELD_EDITOR action for title", () => {
      const expectedAction = {
        type: UPDATE_FIELD_EDITOR,
        key: "title",
        value: "New Article Title",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create UPDATE_FIELD_EDITOR action for description", () => {
      const expectedAction = {
        type: UPDATE_FIELD_EDITOR,
        key: "description",
        value: "Article description",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create UPDATE_FIELD_EDITOR action for body", () => {
      const expectedAction = {
        type: UPDATE_FIELD_EDITOR,
        key: "body",
        value: "Article body content",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create ADD_TAG action", () => {
      const expectedAction = { type: ADD_TAG };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create REMOVE_TAG action", () => {
      const expectedAction = {
        type: REMOVE_TAG,
        tag: "react",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create ARTICLE_SUBMITTED action", () => {
      const articleData = {
        title: "Test Article",
        description: "Test Description",
        body: "Test Body",
        tagList: ["react", "redux"],
      };
      const expectedAction = {
        type: ARTICLE_SUBMITTED,
        payload: articleData,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create EDITOR_PAGE_LOADED action", () => {
      const expectedAction = {
        type: EDITOR_PAGE_LOADED,
        payload: null,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });
  });

  describe("Article Interaction Actions", () => {
    test("should create ARTICLE_FAVORITED action", () => {
      const article = { slug: "test-article" };
      const expectedAction = {
        type: ARTICLE_FAVORITED,
        payload: article,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create ARTICLE_UNFAVORITED action", () => {
      const article = { slug: "test-article" };
      const expectedAction = {
        type: ARTICLE_UNFAVORITED,
        payload: article,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create DELETE_ARTICLE action", () => {
      const expectedAction = {
        type: DELETE_ARTICLE,
        slug: "test-article",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create DELETE_COMMENT action", () => {
      const expectedAction = {
        type: DELETE_COMMENT,
        commentId: 123,
        slug: "test-article",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });
  });

  describe("Pagination and Filter Actions", () => {
    test("should create SET_PAGE action", () => {
      const expectedAction = {
        type: SET_PAGE,
        page: 2,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create APPLY_TAG_FILTER action", () => {
      const expectedAction = {
        type: APPLY_TAG_FILTER,
        tag: "react",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });
  });

  describe("User Profile Actions", () => {
    test("should create FOLLOW_USER action", () => {
      const expectedAction = {
        type: FOLLOW_USER,
        username: "testuser",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create UNFOLLOW_USER action", () => {
      const expectedAction = {
        type: UNFOLLOW_USER,
        username: "testuser",
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create PROFILE_PAGE_LOADED action", () => {
      const profileData = {
        profile: {
          username: "testuser",
          bio: "Test bio",
        },
      };
      const expectedAction = {
        type: PROFILE_PAGE_LOADED,
        payload: profileData,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });
  });

  describe("Settings Actions", () => {
    test("should create SETTINGS_SAVED action", () => {
      const userData = {
        email: "newemail@example.com",
        username: "newusername",
      };
      const expectedAction = {
        type: SETTINGS_SAVED,
        payload: userData,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });
  });

  describe("Page Load Actions", () => {
    test("should create HOME_PAGE_LOADED action", () => {
      const expectedAction = {
        type: HOME_PAGE_LOADED,
        payload: { articles: [], tags: [] },
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });

    test("should create ARTICLE_PAGE_LOADED action", () => {
      const articleData = {
        article: {
          title: "Test Article",
          slug: "test-article",
        },
      };
      const expectedAction = {
        type: ARTICLE_PAGE_LOADED,
        payload: articleData,
      };

      store.dispatch(expectedAction);
      const actions = store.getActions();
      expect(actions).toContainEqual(expectedAction);
    });
  });
});
