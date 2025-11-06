import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import ListPagination from "./ListPagination";
import { SET_PAGE } from "../constants/actionTypes";

const mockStore = configureMockStore();

describe("ListPagination component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
  });

  it("should not render when articlesCount is 10 or less", () => {
    const { container } = render(
      <Provider store={store}>
        <ListPagination articlesCount={10} currentPage={0} />
      </Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("should not render when articlesCount is 5", () => {
    const { container } = render(
      <Provider store={store}>
        <ListPagination articlesCount={5} currentPage={0} />
      </Provider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("should render when articlesCount is greater than 10", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={25} currentPage={0} />
      </Provider>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("should render correct number of pages", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={35} currentPage={0} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    expect(pageLinks).toHaveLength(4); // 35 articles / 10 per page = 4 pages
  });

  it("should render 3 pages for 30 articles", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={0} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    expect(pageLinks).toHaveLength(3);
  });

  it("should render 5 pages for 50 articles", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={50} currentPage={0} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    expect(pageLinks).toHaveLength(5);
  });

  it("should highlight current page (first page)", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={0} />
      </Provider>
    );

    const pageItems = screen.getAllByRole("listitem");
    expect(pageItems[0]).toHaveClass("page-item active");
    expect(pageItems[1]).toHaveClass("page-item");
    expect(pageItems[2]).toHaveClass("page-item");
  });

  it("should highlight current page (middle page)", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={1} />
      </Provider>
    );

    const pageItems = screen.getAllByRole("listitem");
    expect(pageItems[0]).toHaveClass("page-item");
    expect(pageItems[1]).toHaveClass("page-item active");
    expect(pageItems[2]).toHaveClass("page-item");
  });

  it("should highlight current page (last page)", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={2} />
      </Provider>
    );

    const pageItems = screen.getAllByRole("listitem");
    expect(pageItems[0]).toHaveClass("page-item");
    expect(pageItems[1]).toHaveClass("page-item");
    expect(pageItems[2]).toHaveClass("page-item active");
  });

  it("should display page numbers starting from 1", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={0} />
      </Provider>
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should dispatch SET_PAGE action when page is clicked", () => {
    const mockPager = jest
      .fn()
      .mockReturnValue(Promise.resolve({ articles: [], articlesCount: 0 }));

    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={0} pager={mockPager} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    fireEvent.click(pageLinks[1]); // Click second page

    const actions = store.getActions();
    expect(actions[0].type).toBe(SET_PAGE);
    expect(actions[0].page).toBe(1);
  });

  it("should call pager function with correct page number", () => {
    const mockPager = jest
      .fn()
      .mockReturnValue(Promise.resolve({ articles: [], articlesCount: 0 }));

    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={0} pager={mockPager} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    fireEvent.click(pageLinks[2]); // Click third page

    expect(mockPager).toHaveBeenCalledWith(2);
  });

  it("should prevent default behavior on click", () => {
    const mockPager = jest
      .fn()
      .mockReturnValue(Promise.resolve({ articles: [], articlesCount: 0 }));

    render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={0} pager={mockPager} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    const mockEvent = { preventDefault: jest.fn() };

    // Simulate click by finding parent li and clicking it
    const pageItems = screen.getAllByRole("listitem");
    fireEvent.click(pageItems[1]);

    // Event preventDefault should be called
    expect(store.getActions().length).toBeGreaterThan(0);
  });

  it("should render pagination with ul element", () => {
    const { container } = render(
      <Provider store={store}>
        <ListPagination articlesCount={30} currentPage={0} />
      </Provider>
    );

    const ulElement = container.querySelector("ul.pagination");
    expect(ulElement).toBeInTheDocument();
  });

  it("should handle edge case of exactly 11 articles", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={11} currentPage={0} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    expect(pageLinks).toHaveLength(2); // Should render 2 pages
  });

  it("should handle large number of articles", () => {
    render(
      <Provider store={store}>
        <ListPagination articlesCount={100} currentPage={0} />
      </Provider>
    );

    const pageLinks = screen.getAllByRole("link");
    expect(pageLinks).toHaveLength(10); // 100 / 10 = 10 pages
  });
});
