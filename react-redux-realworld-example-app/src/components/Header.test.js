import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";

describe("Header Component", () => {
  const defaultProps = {
    appName: "Conduit",
    currentUser: null,
  };

  const renderHeader = (props = {}) => {
    return render(
      <BrowserRouter>
        <Header {...defaultProps} {...props} />
      </BrowserRouter>
    );
  };

  describe("When user is not logged in", () => {
    test("should render app name", () => {
      renderHeader();

      expect(screen.getByText("conduit")).toBeInTheDocument();
    });

    test("should display Home link", () => {
      renderHeader();

      const homeLinks = screen.getAllByText("Home");
      expect(homeLinks.length).toBeGreaterThan(0);
      expect(homeLinks[0].closest("a")).toHaveAttribute("href", "/");
    });

    test("should display Sign in link", () => {
      renderHeader();

      expect(screen.getByText("Sign in")).toBeInTheDocument();
      expect(screen.getByText("Sign in").closest("a")).toHaveAttribute(
        "href",
        "/login"
      );
    });

    test("should display Sign up link", () => {
      renderHeader();

      expect(screen.getByText("Sign up")).toBeInTheDocument();
      expect(screen.getByText("Sign up").closest("a")).toHaveAttribute(
        "href",
        "/register"
      );
    });

    test("should not display logged in navigation", () => {
      renderHeader();

      expect(screen.queryByText("New Post")).not.toBeInTheDocument();
      expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    });
  });

  describe("When user is logged in", () => {
    const currentUser = {
      username: "testuser",
      email: "test@example.com",
      image: "https://example.com/avatar.jpg",
    };

    test("should render app name", () => {
      renderHeader({ currentUser });

      expect(screen.getByText("conduit")).toBeInTheDocument();
    });

    test("should display Home link", () => {
      renderHeader({ currentUser });

      const homeLinks = screen.getAllByText("Home");
      expect(homeLinks.length).toBeGreaterThan(0);
    });

    test("should display New Post link", () => {
      renderHeader({ currentUser });

      expect(screen.getByText(/New Post/i)).toBeInTheDocument();
      expect(screen.getByText(/New Post/i).closest("a")).toHaveAttribute(
        "href",
        "/editor"
      );
    });

    test("should display Settings link", () => {
      renderHeader({ currentUser });

      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Settings/i).closest("a")).toHaveAttribute(
        "href",
        "/settings"
      );
    });

    test("should display user profile link with username", () => {
      renderHeader({ currentUser });

      expect(screen.getByText("testuser")).toBeInTheDocument();
      expect(screen.getByText("testuser").closest("a")).toHaveAttribute(
        "href",
        "/@testuser"
      );
    });

    test("should display user avatar", () => {
      renderHeader({ currentUser });

      const avatar = screen.getByAltText("testuser");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    test("should use default avatar when user has no image", () => {
      const userWithoutImage = {
        username: "testuser",
        email: "test@example.com",
      };

      renderHeader({ currentUser: userWithoutImage });

      const avatar = screen.getByAltText("testuser");
      expect(avatar).toHaveAttribute(
        "src",
        "https://static.productionready.io/images/smiley-cyrus.jpg"
      );
    });

    test("should not display Sign in/Sign up links", () => {
      renderHeader({ currentUser });

      expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
      expect(screen.queryByText("Sign up")).not.toBeInTheDocument();
    });

    test("should have correct navbar structure", () => {
      const { container } = renderHeader({ currentUser });

      expect(container.querySelector("nav.navbar")).toBeInTheDocument();
      expect(container.querySelector(".container")).toBeInTheDocument();
    });
  });

  describe("App name rendering", () => {
    test("should render app name in lowercase", () => {
      renderHeader({ appName: "REALWORLD" });

      expect(screen.getByText("realworld")).toBeInTheDocument();
    });

    test("should link app name to home page", () => {
      renderHeader();

      const appNameLink = screen.getByText("conduit").closest("a");
      expect(appNameLink).toHaveAttribute("href", "/");
    });
  });
});
