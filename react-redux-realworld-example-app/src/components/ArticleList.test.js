import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureMockStore from "redux-mock-store";
import ArticleList from "./ArticleList";

const mockStore = configureMockStore();

const renderWithProviders = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

describe("ArticleList component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  it("should show loading when articles is null", () => {
    renderWithProviders(<ArticleList articles={null} />, store);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show loading when articles is undefined", () => {
    renderWithProviders(<ArticleList />, store);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show empty state when articles array is empty", () => {
    renderWithProviders(<ArticleList articles={[]} />, store);

    expect(
      screen.getByText("No articles are here... yet.")
    ).toBeInTheDocument();
  });

  it("should render articles when provided", () => {
    const articles = [
      {
        slug: "article-1",
        title: "Test Article 1",
        description: "Description 1",
        author: { username: "user1", image: "img1.jpg" },
        createdAt: "2024-01-01",
        favorited: false,
        favoritesCount: 5,
        tagList: ["react"],
      },
      {
        slug: "article-2",
        title: "Test Article 2",
        description: "Description 2",
        author: { username: "user2", image: "img2.jpg" },
        createdAt: "2024-01-02",
        favorited: true,
        favoritesCount: 10,
        tagList: ["javascript"],
      },
    ];

    renderWithProviders(
      <ArticleList articles={articles} articlesCount={2} currentPage={0} />,
      store
    );

    expect(screen.getByText("Test Article 1")).toBeInTheDocument();
    expect(screen.getByText("Test Article 2")).toBeInTheDocument();
  });

  it("should render single article", () => {
    const articles = [
      {
        slug: "article-1",
        title: "Single Article",
        description: "Single description",
        author: { username: "user1", image: "img.jpg" },
        createdAt: "2024-01-01",
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
    ];

    renderWithProviders(
      <ArticleList articles={articles} articlesCount={1} currentPage={0} />,
      store
    );

    expect(screen.getByText("Single Article")).toBeInTheDocument();
  });

  it("should render ListPagination component", () => {
    const articles = [
      {
        slug: "article-1",
        title: "Test Article",
        description: "Description",
        author: { username: "user1", image: "img.jpg" },
        createdAt: "2024-01-01",
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
    ];

    renderWithProviders(
      <ArticleList articles={articles} articlesCount={25} currentPage={0} />,
      store
    );

    // ListPagination should render when articlesCount > 10
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should not render pagination when articles count is low", () => {
    const articles = [
      {
        slug: "article-1",
        title: "Test Article",
        description: "Description",
        author: { username: "user1", image: "img.jpg" },
        createdAt: "2024-01-01",
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
    ];

    const { container } = renderWithProviders(
      <ArticleList articles={articles} articlesCount={5} currentPage={0} />,
      store
    );

    // ListPagination should not render when articlesCount <= 10
    expect(container.querySelector("nav")).not.toBeInTheDocument();
  });

  it("should pass pager prop to ListPagination", () => {
    const articles = [
      {
        slug: "article-1",
        title: "Test Article",
        description: "Description",
        author: { username: "user1", image: "img.jpg" },
        createdAt: "2024-01-01",
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
    ];
    const mockPager = jest.fn();

    renderWithProviders(
      <ArticleList
        articles={articles}
        articlesCount={25}
        currentPage={0}
        pager={mockPager}
      />,
      store
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should render multiple articles with correct keys", () => {
    const articles = [
      {
        slug: "article-1",
        title: "Article 1",
        description: "Desc 1",
        author: { username: "user1", image: "img.jpg" },
        createdAt: "2024-01-01",
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
      {
        slug: "article-2",
        title: "Article 2",
        description: "Desc 2",
        author: { username: "user2", image: "img.jpg" },
        createdAt: "2024-01-02",
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
      {
        slug: "article-3",
        title: "Article 3",
        description: "Desc 3",
        author: { username: "user3", image: "img.jpg" },
        createdAt: "2024-01-03",
        favorited: false,
        favoritesCount: 0,
        tagList: [],
      },
    ];

    renderWithProviders(
      <ArticleList articles={articles} articlesCount={3} currentPage={0} />,
      store
    );

    expect(screen.getByText("Article 1")).toBeInTheDocument();
    expect(screen.getByText("Article 2")).toBeInTheDocument();
    expect(screen.getByText("Article 3")).toBeInTheDocument();
  });
});
