import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart, type CartItem } from "./cart";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const shirt = {
  id: "p1",
  name: "Cotton Kurta",
  category: "readymade",
  price: 999,
  size: "M",
};

const makeItem = (over: Partial<CartItem> = {}): CartItem => ({
  id: "p1",
  name: "Cotton Kurta",
  category: "readymade",
  price: 999,
  quantity: 1,
  size: "M",
  ...over,
});

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with an empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.subtotal).toBe(0);
  });

  it("adds an item and computes totals", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(shirt));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalCount).toBe(1);
    expect(result.current.subtotal).toBe(999);
  });

  it("merges the same product+size instead of duplicating lines", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(shirt));
    act(() => result.current.addToCart({ ...shirt, quantity: 2 }));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.subtotal).toBe(2997);
  });

  it("treats the same product in a different size as a separate line", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(shirt));
    act(() => result.current.addToCart({ ...shirt, size: "L" }));

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.map((i) => i.size).sort()).toEqual(["L", "M"]);
  });

  it("defaults quantity to 1 and size to M when omitted", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart({ id: "p2", name: "Saree", category: "saree", price: 1500, size: "" }));

    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.items[0].size).toBe("M");
  });

  it("updateQuantity applies a delta and removes the line at zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(shirt));
    act(() => result.current.updateQuantity("p1", 2, "M"));
    expect(result.current.items[0].quantity).toBe(3);

    act(() => result.current.updateQuantity("p1", -3, "M"));
    expect(result.current.items).toHaveLength(0);
  });

  it("updateQuantity only affects the given size", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(shirt));
    act(() => result.current.addToCart({ ...shirt, size: "L" }));
    act(() => result.current.updateQuantity("p1", 1, "M"));

    expect(result.current.items.find((i) => i.size === "M")!.quantity).toBe(2);
    expect(result.current.items.find((i) => i.size === "L")!.quantity).toBe(1);
  });

  it("removeFromCart targets a specific size when provided", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.addToCart(shirt));
    act(() => result.current.addToCart({ ...shirt, size: "L" }));

    act(() => result.current.removeFromCart("p1", "M"));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].size).toBe("L");

    act(() => result.current.removeFromCart("p1"));
    expect(result.current.items).toHaveLength(0);
  });

  it("clearCart empties everything", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(shirt);
      result.current.addToCart({ id: "p3", name: "Dupatta", category: "fabric", price: 300, size: "M" });
    });
    act(() => result.current.clearCart());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalCount).toBe(0);
  });

  it("persists the cart to localStorage and restores it on mount", () => {
    const first = renderHook(() => useCart(), { wrapper });
    act(() => first.result.current.addToCart(makeItem({ id: "p9", name: "Lehenga", price: 4999 })));

    const saved = JSON.parse(localStorage.getItem("appareldesk_cart_items_v1") || "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ id: "p9", quantity: 1 });

    // fresh provider instance should restore the saved cart
    const second = renderHook(() => useCart(), { wrapper });
    expect(second.result.current.items).toHaveLength(1);
    expect(second.result.current.items[0].name).toBe("Lehenga");
  });

  it("throws when useCart is used outside the provider", () => {
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/i);
  });
});
