import React from "react";
import { render, screen } from "@testing-library/react";
import ListErrors from "./ListErrors";

describe("ListErrors component", () => {
  it("should not render when errors prop is null", () => {
    const { container } = render(<ListErrors errors={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when errors prop is undefined", () => {
    const { container } = render(<ListErrors />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when errors object is empty", () => {
    const { container } = render(<ListErrors errors={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it("should render error list when errors exist", () => {
    const errors = {
      email: ["is invalid", "is required"],
      password: ["is too short"],
    };
    render(<ListErrors errors={errors} />);

    const errorMessages = screen.getAllByRole("listitem");
    expect(errorMessages).toHaveLength(3);
  });

  it("should render single error message", () => {
    const errors = {
      username: ["is already taken"],
    };
    render(<ListErrors errors={errors} />);

    expect(screen.getByText(/username is already taken/i)).toBeInTheDocument();
  });

  it("should render multiple errors for single field", () => {
    const errors = {
      password: [
        "is too short",
        "must contain special characters",
        "is required",
      ],
    };
    render(<ListErrors errors={errors} />);

    const errorMessages = screen.getAllByRole("listitem");
    expect(errorMessages).toHaveLength(3);
    expect(screen.getByText(/password is too short/i)).toBeInTheDocument();
    expect(
      screen.getByText(/password must contain special characters/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("should render multiple fields with errors", () => {
    const errors = {
      email: ["is invalid"],
      username: ["is already taken"],
      password: ["is too short"],
    };
    render(<ListErrors errors={errors} />);

    const errorMessages = screen.getAllByRole("listitem");
    expect(errorMessages).toHaveLength(3);
  });

  it("should display field name with error message", () => {
    const errors = {
      title: ["can't be blank"],
    };
    render(<ListErrors errors={errors} />);

    expect(screen.getByText(/title can't be blank/i)).toBeInTheDocument();
  });

  it("should render ul element with correct class", () => {
    const errors = {
      email: ["is invalid"],
    };
    const { container } = render(<ListErrors errors={errors} />);

    const ulElement = container.querySelector("ul.error-messages");
    expect(ulElement).toBeInTheDocument();
  });
});
