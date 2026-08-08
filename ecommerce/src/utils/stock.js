export const isSizeOutOfStock = (stock, size) => {
  if (!stock) return false;
  const qty = stock[size];
  return qty !== undefined && qty !== null && qty <= 0;
};

export const isProductOutOfStock = (sizes, stock) => {
  if (!sizes || sizes.length === 0) return false;
  if (!stock || Object.keys(stock).length === 0) return false;
  return sizes.every((size) => isSizeOutOfStock(stock, size));
};
