// A product is sold out either because stock hit zero, or because an
// admin/seller manually flagged it as sold out without touching stock.
export const isProductSoldOut = (product) =>
  !product || product.stock === 0 || !!product.isSoldOut;
