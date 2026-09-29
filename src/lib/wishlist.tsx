import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import { wishlistApi } from "@/lib/api";
import { tokenStorage } from "@/lib/api/client";
import type { Product } from "@/lib/api/types";

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const WISHLIST_STORAGE_KEY = "appareldesk_wishlist_items_v1";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function readLocalWishlist(): Product[] {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(items: Product[]) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save wishlist to localStorage", e);
  }
}

const pid = (p: Product) => (p._id || p.id || "").toString();

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(readLocalWishlist);
  const [hasToken, setHasToken] = useState<boolean>(() => !!tokenStorage.get());
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Keep track of sign-in / sign-out to switch between server & local wishlist
  useEffect(() => {
    const interval = window.setInterval(() => {
      setHasToken(!!tokenStorage.get());
    }, 800);
    return () => window.clearInterval(interval);
  }, []);

  // When signed in, adopt the server wishlist (source of truth).
  // Guests keep using localStorage.
  useEffect(() => {
    let cancelled = false;

    if (hasToken) {
      wishlistApi
        .list()
        .then((items) => {
          if (!cancelled && Array.isArray(items)) setWishlist(items);
        })
        .catch(() => {
          // offline / server down — keep whatever list we already have
        });
    } else {
      setWishlist(readLocalWishlist());
    }

    return () => {
      cancelled = true;
    };
  }, [hasToken]);

  const isInWishlist = (id: string) => wishlist.some((item) => pid(item) === id);

  const toggleWishlist = (product: Product) => {
    const id = pid(product);
    const wasWishlisted = isInWishlist(id);

    // Optimistic UI update first
    setWishlist((prev) =>
      wasWishlisted ? prev.filter((item) => pid(item) !== id) : [product, ...prev],
    );

    if (wasWishlisted) {
      toast.info(`Removed "${product.name}" from your wishlist`);
    } else {
      toast.success(`Saved "${product.name}" to your wishlist!`, {
        action: { label: "View Wishlist", onClick: () => setIsWishlistOpen(true) },
      });
    }

    if (tokenStorage.get()) {
      wishlistApi.toggle(id).catch(() => null);
    } else {
      // Persist guest changes locally
      setWishlist((current) => {
        writeLocalWishlist(current);
        return current;
      });
    }
  };

  const removeFromWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = prev.filter((item) => pid(item) !== id);
      if (!tokenStorage.get()) writeLocalWishlist(next);
      return next;
    });
    toast.info("Item removed from wishlist");
    if (tokenStorage.get()) {
      wishlistApi.remove(id).catch(() => null);
    }
  };

  const clearWishlist = () => {
    setWishlist(() => {
      if (!tokenStorage.get()) writeLocalWishlist([]);
      return [];
    });
    toast.info("Wishlist cleared");
    if (tokenStorage.get()) {
      wishlistApi.clear().catch(() => null);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlistOpen,
        setIsWishlistOpen,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
