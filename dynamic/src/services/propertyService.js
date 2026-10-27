/**
 * propertyService.js
 * 
 * [MODULE ON HOLD / DECOUPLED]
 * The backend logic for Property/Inventory Management is currently incomplete
 * and under active refactoring by the backend team.
 * 
 * In accordance with the decoupling initiative, active API calls have been paused
 * and safe stubs are returned to prevent runtime frontend crashes and network errors.
 */

export const propertyService = {
  /**
   * Fetch all products or query dynamically by id, productName, or memberId
   * (PAUSED: Returns empty array to prevent frontend crashes while backend is updated)
   */
  getProducts: async () => {
    console.warn('[PropertyService] getProducts is temporarily paused: backend inventory logic is under construction.');
    return [];
  },

  /**
   * Fetch a single product by ID
   * (PAUSED: Returns null while backend is updated)
   */
  getProductById: async (id) => {
    console.warn(`[PropertyService] getProductById(${id}) is temporarily paused.`);
    return null;
  },

  /**
   * Create / register a new product
   * (PAUSED: Rejects gracefully with informative message)
   */
  createProduct: async () => {
    console.warn('[PropertyService] createProduct is temporarily paused.');
    throw new Error('Property and Asset registration is temporarily on hold while backend inventory logic is undergoing maintenance.');
  },

  /**
   * Update an existing product by ID
   * (PAUSED: Rejects gracefully with informative message)
   */
  updateProduct: async (id) => {
    console.warn(`[PropertyService] updateProduct(${id}) is temporarily paused.`);
    throw new Error('Property updates are temporarily on hold while backend inventory logic is undergoing maintenance.');
  },

  /**
   * Delete / deactivate a product by ID
   * (PAUSED: Rejects gracefully with informative message)
   */
  deleteProduct: async (id) => {
    console.warn(`[PropertyService] deleteProduct(${id}) is temporarily paused.`);
    throw new Error('Property deletion is temporarily on hold while backend inventory logic is undergoing maintenance.');
  },
};
