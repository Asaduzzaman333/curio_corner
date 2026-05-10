import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item._id === product._id);
      if (existing) {
        return current.map((item) => (item._id === product._id ? { ...item, quantity: item.quantity + quantity } : item));
      }
      const price = product.discountPrice || product.price;
      return [...current, { ...product, price, quantity }];
    });
    toast.success("Added to cart");
  };

  const removeItem = (id) => setItems((current) => current.filter((item) => item._id !== id));
  const updateQuantity = (id, quantity) =>
    setItems((current) => current.map((item) => (item._id === id ? { ...item, quantity: Math.max(1, quantity) } : item)));
  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(() => ({ items, addItem, removeItem, updateQuantity, clearCart, subtotal, count }), [items, subtotal, count]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
