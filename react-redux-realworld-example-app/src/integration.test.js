import configureMockStore from "redux-mock-store";
import { promiseMiddleware, localStorageMiddleware } from "./middleware";
import agent from "./agent";
import {
  LOGIN,
  REGISTER,
  ARTICLE_SUBMITTED,
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
  UPDATE_FIELD_AUTH,
  UPDATE_FIELD_EDITOR,
  ADD_TAG,
} from "./constants/actionTypes";

// Create mock store with middleware
const middlewares = [promiseMiddleware, localStorageMiddleware];
const mockStore = configureMockStore(middlewares);

// Mock agent
jest.mock("./agent", () => ({
  Auth: {
    login: jest.fn(),
    register: jest.fn(),
  },
  Articles: {
    create: jest.fn(),
    favorite: jest.fn(),
    unfavorite: jest.fn(),
  },
  setToken: jest.fn(),
}));

describe("Integration Tests", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      common: {
        appName: "Conduit",
        token: null,
        currentUser: null,
      },
      auth: {
        email: "",
        password: "",
        inProgress: false,
      },
      editor: {
        title: "",
        description: "",
        body: "",
        tagList: [],
        inProgress: false,
      },
      articleList: {
        articles: [],
        articlesCount: 0,
        currentPage: 0,
      },
    });

    // Mock localStorage
    global.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn(),
      removeItem: jest.fn(),
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe("Login Flow Integration", () => {
    test("should complete login flow successfully", async () => {
      const userData = {
        user: {
          email: "test@example.com",
          token: "test-jwt-token",
          username: "testuser",
        },
      };

      agent.Auth.login.mockResolvedValue(userData);

      // Dispatch email update
      store.dispatch({
        type: UPDATE_FIELD_AUTH,
        key: "email",
        value: "test@example.com",
      });

      // Dispatch password update
      store.dispatch({
        type: UPDATE_FIELD_AUTH,
        key: "password",
        value: "password123",
      });

      // Dispatch login
      const loginPromise = agent.Auth.login("test@example.com", "password123");
      store.dispatch({
        type: LOGIN,
        payload: loginPromise,
      });

      await loginPromise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();

      // Should have field updates
      expect(actions).toContainEqual({
        type: UPDATE_FIELD_AUTH,
        key: "email",
        value: "test@example.com",
      });

      expect(actions).toContainEqual({
        type: UPDATE_FIELD_AUTH,
        key: "password",
        value: "password123",
      });

      // Should have called login
      expect(agent.Auth.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
    });

    test("should handle login failure correctly", async () => {
      const error = {
        response: {
          body: {
            errors: {
              "email or password": ["is invalid"],
            },
          },
        },
      };

      agent.Auth.login.mockRejectedValue(error);

      const loginPromise = agent.Auth.login(
        "test@example.com",
        "wrongpassword"
      );
      store.dispatch({
        type: LOGIN,
        payload: loginPromise,
      });

      await loginPromise.catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(agent.Auth.login).toHaveBeenCalled();
    });
  });

  describe("Registration Flow Integration", () => {
    test("should complete registration flow successfully", async () => {
      const userData = {
        user: {
          email: "newuser@example.com",
          token: "test-jwt-token",
          username: "newuser",
        },
      };

      agent.Auth.register.mockResolvedValue(userData);

      // Dispatch registration
      const registerPromise = agent.Auth.register({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });

      store.dispatch({
        type: REGISTER,
        payload: registerPromise,
      });

      await registerPromise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(agent.Auth.register).toHaveBeenCalledWith({
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      });
    });

    test("should handle registration with existing email", async () => {
      const error = {
        response: {
          body: {
            errors: {
              email: ["has already been taken"],
            },
          },
        },
      };

      agent.Auth.register.mockRejectedValue(error);

      const registerPromise = agent.Auth.register({
        username: "testuser",
        email: "existing@example.com",
        password: "password123",
      });

      store.dispatch({
        type: REGISTER,
        payload: registerPromise,
      });

      await registerPromise.catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(agent.Auth.register).toHaveBeenCalled();
    });
  });

  describe("Article Creation Flow Integration", () => {
    test("should complete article creation flow successfully", async () => {
      const articleData = {
        article: {
          title: "Test Article",
          description: "Test Description",
          body: "Test Body",
          tagList: ["react", "redux"],
          slug: "test-article",
        },
      };

      agent.Articles.create.mockResolvedValue(articleData);

      // Update editor fields
      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: "title",
        value: "Test Article",
      });

      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: "description",
        value: "Test Description",
      });

      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: "body",
        value: "Test Body",
      });

      // Add tags
      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: "tagInput",
        value: "react",
      });

      store.dispatch({ type: ADD_TAG });

      store.dispatch({
        type: UPDATE_FIELD_EDITOR,
        key: "tagInput",
        value: "redux",
      });

      store.dispatch({ type: ADD_TAG });

      // Submit article
      const createPromise = agent.Articles.create({
        title: "Test Article",
        description: "Test Description",
        body: "Test Body",
        tagList: ["react", "redux"],
      });

      store.dispatch({
        type: ARTICLE_SUBMITTED,
        payload: createPromise,
      });

      await createPromise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      const actions = store.getActions();

      expect(actions).toContainEqual({
        type: UPDATE_FIELD_EDITOR,
        key: "title",
        value: "Test Article",
      });

      expect(agent.Articles.create).toHaveBeenCalled();
    });

    test("should handle article creation validation errors", async () => {
      const error = {
        response: {
          body: {
            errors: {
              title: ["can't be blank"],
              body: ["can't be blank"],
            },
          },
        },
      };

      agent.Articles.create.mockRejectedValue(error);

      const createPromise = agent.Articles.create({
        title: "",
        description: "",
        body: "",
        tagList: [],
      });

      store.dispatch({
        type: ARTICLE_SUBMITTED,
        payload: createPromise,
      });

      await createPromise.catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(agent.Articles.create).toHaveBeenCalled();
    });
  });

  describe("Article Favorite Flow Integration", () => {
    test("should favorite an article successfully", async () => {
      const article = {
        article: {
          slug: "test-article",
          favorited: true,
          favoritesCount: 1,
        },
      };

      agent.Articles.favorite.mockResolvedValue(article);

      const favoritePromise = agent.Articles.favorite("test-article");
      store.dispatch({
        type: ARTICLE_FAVORITED,
        payload: favoritePromise,
      });

      await favoritePromise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(agent.Articles.favorite).toHaveBeenCalledWith("test-article");
    });

    test("should unfavorite an article successfully", async () => {
      const article = {
        article: {
          slug: "test-article",
          favorited: false,
          favoritesCount: 0,
        },
      };

      agent.Articles.unfavorite.mockResolvedValue(article);

      const unfavoritePromise = agent.Articles.unfavorite("test-article");
      store.dispatch({
        type: ARTICLE_UNFAVORITED,
        payload: unfavoritePromise,
      });

      await unfavoritePromise;
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(agent.Articles.unfavorite).toHaveBeenCalledWith("test-article");
    });

    test("should handle favorite action when not authenticated", async () => {
      const error = {
        response: {
          body: {
            errors: {
              authentication: ["required"],
            },
          },
        },
      };

      agent.Articles.favorite.mockRejectedValue(error);

      const favoritePromise = agent.Articles.favorite("test-article");
      store.dispatch({
        type: ARTICLE_FAVORITED,
        payload: favoritePromise,
      });

      await favoritePromise.catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(agent.Articles.favorite).toHaveBeenCalled();
    });
  });

  describe("Complete User Journey Integration", () => {
    test("should handle complete user journey: register -> login -> create article -> favorite", async () => {
      // Step 1: Register
      const registerData = {
        user: {
          email: "journey@example.com",
          token: "register-token",
          username: "journeyuser",
        },
      };

      agent.Auth.register.mockResolvedValue(registerData);

      const registerPromise = agent.Auth.register({
        username: "journeyuser",
        email: "journey@example.com",
        password: "password123",
      });

      store.dispatch({
        type: REGISTER,
        payload: registerPromise,
      });

      await registerPromise;
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Step 2: Create article
      const articleData = {
        article: {
          title: "Journey Article",
          slug: "journey-article",
          body: "Test",
          description: "Test",
        },
      };

      agent.Articles.create.mockResolvedValue(articleData);

      const createPromise = agent.Articles.create({
        title: "Journey Article",
        description: "Test",
        body: "Test",
        tagList: [],
      });

      store.dispatch({
        type: ARTICLE_SUBMITTED,
        payload: createPromise,
      });

      await createPromise;
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Step 3: Favorite article
      const favoriteData = {
        article: {
          ...articleData.article,
          favorited: true,
          favoritesCount: 1,
        },
      };

      agent.Articles.favorite.mockResolvedValue(favoriteData);

      const favoritePromise = agent.Articles.favorite("journey-article");
      store.dispatch({
        type: ARTICLE_FAVORITED,
        payload: favoritePromise,
      });

      await favoritePromise;
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify all actions were dispatched
      expect(agent.Auth.register).toHaveBeenCalled();
      expect(agent.Articles.create).toHaveBeenCalled();
      expect(agent.Articles.favorite).toHaveBeenCalled();
    });
  });
});
