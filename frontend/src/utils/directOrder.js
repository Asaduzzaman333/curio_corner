const DIRECT_ORDER_KEY = "curioDirectOrder";

export const createDirectOrderItem = (product, quantity = 1) => ({
  ...product,
  price: product.discountPrice || product.price,
  quantity: Math.max(1, Number(quantity) || 1)
});

export const saveDirectOrder = (item) => {
  sessionStorage.setItem(DIRECT_ORDER_KEY, JSON.stringify(item));
};

export const readDirectOrder = () => {
  try {
    return JSON.parse(sessionStorage.getItem(DIRECT_ORDER_KEY) || "null");
  } catch {
    return null;
  }
};

export const clearDirectOrder = () => {
  sessionStorage.removeItem(DIRECT_ORDER_KEY);
};
