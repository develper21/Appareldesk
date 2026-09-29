import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  size: string;
  color?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQuantity: (id: string, delta: number, size?: string) => void;
  clearCart: () => void;
}

const CART_STORAGE_KEY = "appareldesk_cart_items_v1";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    const selectedSize = newItem.size || "M";

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (i) => i.id === newItem.id && i.size === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            ...newItem,
            size: selectedSize,
            quantity: qty,
          },
        ];
      }
    });

    toast.success(`Added ${newItem.name} (${selectedSize}) to cart!`, {
      action: {
        label: "View Cart",
        onClick: () => setIsCartOpen(true),
      },
    });
  };

  const removeFromCart = (id: string, size?: string) => {
    setItems((prev) =>
      prev.filter((item) => (size ? !(item.id === id && item.size === size) : item.id !== id))
    );
    toast.info("Item removed from cart");
  };

  const updateQuantity = (id: string, delta: number, size?: string) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id && (!size || item.size === size)) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
