import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (class merge utility)", () => {
  it("joins simple class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("ignores falsy inputs (conditional classes)", () => {
    const isHidden = false;
    expect(cn("base", isHidden && "hidden", undefined, null, "visible")).toBe("base visible");
  });

  it("deduplicates conflicting tailwind classes, last one wins", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("keeps non-conflicting tailwind classes together", () => {
    expect(cn("px-4", "py-2", "rounded-lg")).toBe("px-4 py-2 rounded-lg");
  });

  it("merges tailwind classes from objects and arrays", () => {
    expect(cn(["p-4", "m-2"], { "hidden": false, "block": true })).toBe("p-4 m-2 block");
  });

  it("returns empty string for no input", () => {
    expect(cn()).toBe("");
  });
});
