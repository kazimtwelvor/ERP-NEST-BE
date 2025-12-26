export const INVENTORY_MESSAGES = {
  // Product messages
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_FETCHED: 'Product fetched successfully',
  PRODUCT_LIST_FETCHED: 'Products fetched successfully',
  PRODUCT_SKU_EXISTS: 'Product SKU already exists',
  PRODUCT_HAS_INVENTORY: 'Cannot delete product that has inventory',

  // Inventory Item messages
  INVENTORY_ITEM_CREATED: 'Inventory item created successfully',
  INVENTORY_ITEM_UPDATED: 'Inventory item updated successfully',
  INVENTORY_ITEM_DELETED: 'Inventory item deleted successfully',
  INVENTORY_ITEM_NOT_FOUND: 'Inventory item not found',
  INVENTORY_ITEM_FETCHED: 'Inventory item fetched successfully',
  INVENTORY_ITEM_LIST_FETCHED: 'Inventory items fetched successfully',
  INVENTORY_ITEM_EXISTS: 'Inventory item already exists for this product',
  INSUFFICIENT_STOCK: 'Insufficient stock available',
  STOCK_ADJUSTED: 'Stock adjusted successfully',
} as const;
