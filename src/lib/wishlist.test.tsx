import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { WishlistProvider, useWishlist } from "./wishlist";

vi.mock("@/lib/api", () => ({
  wishlistApi: {
    list: vi.fn().mockResolvedValue([]),
    toggle: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/api/client", () => ({
  tokenStorage: {
    get: vi.fn(() => null),
    set: vi.fn(),
    clear: vi.fn(),
  },
}));

import { wishlistApi } from "@/lib/api";
import { tokenStorage } from "@/lib/api/client";

const makeProduct = (id: string, name = "Cotton Kurta") =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ({ _id: id, name, price: 999, category: "readymade" }) as any;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WishlistProvider>{children}</WishlistProvider>
);

describe("WishlistProvider (guest mode — localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (tokenStorage.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it("starts empty for a guest with no saved list", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.wishlist).toEqual([]);
    expect(result.current.wishlistCount).toBe(0);
  });

  it("toggleWishlist adds a product and persists to localStorage", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.toggleWishlist(makeProduct("p1", "Anarkali")));

    expect(result.current.wishlistCount).toBe(1);
    expect(result.current.isInWishlist("p1")).toBe(true);
    expect(wishlistApi.toggle).not.toHaveBeenCalled(); // guest → no API call

    const saved = JSON.parse(localStorage.getItem("appareldesk_wishlist_items_v1") || "[]");
    expect(saved[0]).toMatchObject({ _id: "p1", name: "Anarkali" });
  });

  it("toggleWishlist removes an existing product (toggle off)", () => {
    localStorage.setItem("appareldesk_wishlist_items_v1", JSON.stringify([makeProduct("p1")]));

    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.isInWishlist("p1")).toBe(true);

    act(() => result.current.toggleWishlist(makeProduct("p1")));

    expect(result.current.wishlistCount).toBe(0);
    expect(result.current.isInWishlist("p1")).toBe(false);
  });

  it("removeFromWishlist removes by id and persists", () => {
    localStorage.setItem(
      "appareldesk_wishlist_items_v1",
      JSON.stringify([makeProduct("p1"), makeProduct("p2", "Saree")])
    );

    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.removeFromWishlist("p1"));

    expect(result.current.wishlist.map((p) => p._id)).toEqual(["p2"]);
    const saved = JSON.parse(localStorage.getItem("appareldesk_wishlist_items_v1") || "[]");
    expect(saved).toHaveLength(1);
  });

  it("clearWishlist empties the list and storage", () => {
    localStorage.setItem("appareldesk_wishlist_items_v1", JSON.stringify([makeProduct("p1")]));

    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.wishlistCount).toBe(1);

    act(() => result.current.clearWishlist());

    expect(result.current.wishlistCount).toBe(0);
    expect(JSON.parse(localStorage.getItem("appareldesk_wishlist_items_v1") || "[]")).toEqual([]);
  });

  it("handles products that use `id` instead of `_id`", () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });

    act(() => result.current.toggleWishlist({ id: "legacy-1", name: "Kurta" } as unknown as never));

    expect(result.current.isInWishlist("legacy-1")).toBe(true);
  });

  it("throws when useWishlist is used outside the provider", () => {
    expect(() => renderHook(() => useWishlist())).toThrow(/WishlistProvider/i);
  });
});

describe("WishlistProvider (signed-in mode — server sync)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    (tokenStorage.get as ReturnType<typeof vi.fn>).mockReturnValue("valid-jwt-token");
  });

  it("adopts the server wishlist on mount", async () => {
    (wishlistApi.list as ReturnType<typeof vi.fn>).mockResolvedValue([
      makeProduct("srv-1", "Server Kurta"),
    ]);

    const { result } = renderHook(() => useWishlist(), { wrapper });

    await waitFor(() => expect(result.current.wishlistCount).toBe(1));
    expect(result.current.isInWishlist("srv-1")).toBe(true);
    expect(wishlistApi.list).toHaveBeenCalled();
  });

  it("toggleWishlist syncs through the API instead of localStorage", async () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    await waitFor(() => expect(wishlistApi.list).toHaveBeenCalled());

    act(() => result.current.toggleWishlist(makeProduct("srv-9")));

    expect(result.current.isInWishlist("srv-9")).toBe(true);
    expect(wishlistApi.toggle).toHaveBeenCalledWith("srv-9");
    // server mode must NOT persist locally
    expect(localStorage.getItem("appareldesk_wishlist_items_v1")).toBeNull();
  });

  it("removeFromWishlist calls the API", async () => {
    (wishlistApi.list as ReturnType<typeof vi.fn>).mockResolvedValue([makeProduct("srv-1")]);

    const { result } = renderHook(() => useWishlist(), { wrapper });
    await waitFor(() => expect(result.current.wishlistCount).toBe(1));

    act(() => result.current.removeFromWishlist("srv-1"));

    expect(result.current.wishlistCount).toBe(0);
    expect(wishlistApi.remove).toHaveBeenCalledWith("srv-1");
  });

  it("keeps the current list when the server is unreachable", async () => {
    localStorage.setItem("appareldesk_wishlist_items_v1", JSON.stringify([makeProduct("guest-1")]));
    (wishlistApi.list as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("network down"));

    const { result } = renderHook(() => useWishlist(), { wrapper });

    // brief settle — failed adopt must not wipe the guest list
    await waitFor(() => expect(wishlistApi.list).toHaveBeenCalled());
    expect(result.current.isInWishlist("guest-1")).toBe(true);
  });
});
