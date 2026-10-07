import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavLink } from "./NavLink";

function renderNav(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavLink
        to="/products"
        className="base-class"
        activeClassName="is-active"
        pendingClassName="is-pending"
      >
        Products
      </NavLink>
    </MemoryRouter>
  );
}

describe("NavLink (react-router v5-style className compat)", () => {
  it("renders the link text", () => {
    renderNav("/somewhere-else");
    expect(screen.getByText("Products")).toBeInTheDocument();
  });

  it("applies the activeClassName when the route matches", () => {
    renderNav("/products");
    const link = screen.getByText("Products");
    expect(link).toHaveClass("base-class");
    expect(link).toHaveClass("is-active");
    expect(link).not.toHaveClass("is-pending");
  });

  it("does not apply the activeClassName on other routes", () => {
    renderNav("/dashboard");
    const link = screen.getByText("Products");
    expect(link).toHaveClass("base-class");
    expect(link).not.toHaveClass("is-active");
  });

  it("renders as an anchor with the correct href", () => {
    renderNav("/products");
    expect(screen.getByText("Products").getAttribute("href")).toBe("/products");
  });
});
