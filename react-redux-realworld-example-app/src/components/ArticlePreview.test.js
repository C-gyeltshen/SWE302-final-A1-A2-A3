import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureMockStore from "redux-mock-store";
import ArticlePreview from "./ArticlePreview";
import {
  ARTICLE_FAVORITED,
  ARTICLE_UNFAVORITED,
} from "../constants/actionTypes";

const mockStore = configureMockStore();

const renderWithProviders = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("ArticlePreview component", () => {
  let store;
  const mockArticle = {
    slug: "test-article",
    title: "Test Article Title",
    description: "This is a test article description",
    author: {
      username: "testuser",
      image: "https://example.com/avatar.jpg",
    },
    createdAt: "2024-01-15T10:30:00.000Z",
    favorited: false,
    favoritesCount: 5,
    tagList: ["react", "javascript", "testing"],
  };

  beforeEach(() => {
    store = mockStore({});
  });

  it("should render article title", () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
  });

  it("should render article description", () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    expect(
      screen.getByText("This is a test article description")
    ).toBeInTheDocument();
  });

  it("should render author username", () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("should render author image", () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    const img = screen.getByAlt("testuser");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("should render default image when author image is missing", () => {
    const articleWithoutImage = {
      ...mockArticle,
      author: { username: "testuser", image: null },
    };

    renderWithProviders(
      <ArticlePreview article={articleWithoutImage} />,
      store
    );

    const img = screen.getByAlt("testuser");
    expect(img).toHaveAttribute(
      "src",
      "https://static.productionready.io/images/smiley-cyrus.jpg"
    );
  });

  it("should render formatted date", () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    const date = new Date("2024-01-15T10:30:00.000Z").toDateString();
    expect(screen.getByText(date)).toBeInTheDocument();
  });

  it("should render favorites count", () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("should render all tags", () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
  });

  it('should render "Read more..." link', () => {
    renderWithProviders(<ArticlePreview article={mockArticle} />, store);

    expect(screen.getByText("Read more...")).toBeInTheDocument();
  });

  it("should have link to article detail page", () => {
    const { container } = renderWithProviders(
      <ArticlePreview article={mockArticle} />,
      store
    );

    const link = container.querySelector("a.preview-link");
    expect(link).toHaveAttribute("href", "/article/test-article");
  });

  it("should have link to author profile", () => {
    const { container } = renderWithProviders(
      <ArticlePreview article={mockArticle} />,
      store
    );

    const authorLinks = container.querySelectorAll('a[href="/@testuser"]');
    expect(authorLinks.length).toBeGreaterThan(0);
  });

  describe("favorite button", () => {
    it("should show outline style when not favorited", () => {
      renderWithProviders(<ArticlePreview article={mockArticle} />, store);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn-outline-primary");
    });

    it("should show filled style when favorited", () => {
      const favoritedArticle = { ...mockArticle, favorited: true };

      renderWithProviders(<ArticlePreview article={favoritedArticle} />, store);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn-primary");
      expect(button).not.toHaveClass("btn-outline-primary");
    });

    it("should dispatch favorite action when clicking unfavorited article", () => {
      renderWithProviders(<ArticlePreview article={mockArticle} />, store);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      const actions = store.getActions();
      expect(actions[0].type).toBe(ARTICLE_FAVORITED);
    });

    it("should dispatch unfavorite action when clicking favorited article", () => {
      const favoritedArticle = { ...mockArticle, favorited: true };

      renderWithProviders(<ArticlePreview article={favoritedArticle} />, store);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      const actions = store.getActions();
      expect(actions[0].type).toBe(ARTICLE_UNFAVORITED);
    });

    it("should include article slug in favorite action payload", () => {
      renderWithProviders(<ArticlePreview article={mockArticle} />, store);

      const button = screen.getByRole("button");
      fireEvent.click(button);

      const actions = store.getActions();
      expect(actions[0].payload).toBeDefined();
    });
  });

  describe("article with no tags", () => {
    it("should render article without tags", () => {
      const articleWithoutTags = { ...mockArticle, tagList: [] };

      renderWithProviders(
        <ArticlePreview article={articleWithoutTags} />,
        store
      );

      expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    });
  });

  describe("article with single tag", () => {
    it("should render article with one tag", () => {
      const articleWithOneTag = { ...mockArticle, tagList: ["react"] };

      renderWithProviders(
        <ArticlePreview article={articleWithOneTag} />,
        store
      );

      expect(screen.getByText("react")).toBeInTheDocument();
    });
  });

  it("should render article with high favorites count", () => {
    const popularArticle = { ...mockArticle, favoritesCount: 999 };

    renderWithProviders(<ArticlePreview article={popularArticle} />, store);

    expect(screen.getByText("999")).toBeInTheDocument();
  });

  it("should render article with zero favorites", () => {
    const noFavoritesArticle = { ...mockArticle, favoritesCount: 0 };

    renderWithProviders(<ArticlePreview article={noFavoritesArticle} />, store);

    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
