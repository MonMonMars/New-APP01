import { PRODUCT_CATALOG } from '../constants/products';

export function listStoreProductSkus(): string[] {
  return Object.values(PRODUCT_CATALOG).map((product) => product.storeProductId);
}
