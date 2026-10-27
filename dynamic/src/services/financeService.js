import { apiClient } from './api';

/**
 * financeService.js
 * 
 * Comprehensive service layer for Finance & Sales operations:
 * 1. Suppliers: Vendor management (/suppliers)
 * 2. Products: Product catalog items (/products)
 * 3. Purchases: Inventory intake batches (/purchase-products)
 * 4. Sales: Point of Sale (POS) ledger (/product-sales)
 * 5. Expenses: Operational supplementary costs (/other-costs)
 * 
 * Strictly conforms to live Swagger schemas with exact casing and type coercion.
 */
export const financeService = {
  // ==========================================
  // 1. SUPPLIERS API
  // ==========================================

  /**
   * Fetch all registered suppliers
   * GET /suppliers
   * @returns {Promise<Array>} List of suppliers
   */
  getSuppliers: async () => {
    const data = await apiClient('/suppliers');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.suppliers)) return data.suppliers;
    return [];
  },

  /**
   * Fetch a single supplier by ID
   * GET /suppliers/{id}
   */
  getSupplierById: async (id) => {
    return apiClient(`/suppliers/${Number(id)}`);
  },

  /**
   * Register a new supplier
   * POST /suppliers
   * Strictly adheres to CreateSupplierDto: { name, phone, address, purchaseBy }
   *  - name (string)
   *  - phone (string - external vendor contact phone)
   *  - address (string - vendor physical address)
   *  - purchaseBy (string - member phone number recording this supplier)
   * @param {Object} supplierData - Object containing name, phone, address, purchaseBy
   */
  createSupplier: async (supplierData) => {
    const name = String(supplierData?.name || '').trim();
    // Destructure vendor contact phone
    const phone = String(
      supplierData?.phone ??
      supplierData?.phoneNumber ??
      supplierData?.contactPhone ??
      supplierData?.phone_number ??
      ''
    ).trim();
    const address = String(supplierData?.address || '').trim();
    // Destructure internal member phone who recorded this supplier (Swagger: purchaseBy)
    const purchaseBy = String(
      supplierData?.purchaseBy ??
      supplierData?.recordedBy ??
      supplierData?.memberPhone ??
      supplierData?.registeredBy ??
      ''
    ).trim();

    if (!name) throw new Error('Supplier name is required.');
    if (!phone) throw new Error('Supplier contact phone is required.');
    if (!address) throw new Error('Supplier address is required.');
    if (!purchaseBy) throw new Error('Recorded By (Member Phone) is required.');

    const payload = { name, phone, address, purchaseBy };
    return apiClient('/suppliers', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Update an existing supplier
   * PATCH/PUT /suppliers/{id}
   * @param {number|string} id - Supplier ID
   * @param {Object} updateData - Object containing fields to update (name, phone, address, purchaseBy)
   * @param {Object} [options] - Optional custom configuration (e.g. method: 'PATCH' | 'PUT')
   */
  updateSupplier: async (id, updateData, options = {}) => {
    const payload = {};
    if (updateData?.name !== undefined) payload.name = String(updateData.name).trim();

    const phoneVal =
      updateData?.phone ??
      updateData?.phoneNumber ??
      updateData?.contactPhone ??
      updateData?.phone_number;
    if (phoneVal !== undefined) payload.phone = String(phoneVal).trim();

    if (updateData?.address !== undefined) payload.address = String(updateData.address).trim();

    const purchaseByVal =
      updateData?.purchaseBy ??
      updateData?.recordedBy ??
      updateData?.memberPhone ??
      updateData?.registeredBy;
    if (purchaseByVal !== undefined) payload.purchaseBy = String(purchaseByVal).trim();

    const method = options.method || 'PATCH';
    return apiClient(`/suppliers/${Number(id)}`, {
      method,
      body: payload,
    });
  },

  /**
   * Update a supplier using explicit PUT
   * PUT /suppliers/{id}
   */
  putSupplier: async (id, updateData) => {
    return financeService.updateSupplier(id, updateData, { method: 'PUT' });
  },

  /**
   * Delete a supplier by ID
   * DELETE /suppliers/{id}
   */
  deleteSupplier: async (id) => {
    return apiClient(`/suppliers/${Number(id)}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // 2. PRODUCTS API
  // ==========================================

  /**
   * Fetch all registered products
   * GET /products
   * @returns {Promise<Array>} List of products
   */
  getProducts: async () => {
    const data = await apiClient('/products');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.products)) return data.products;
    return [];
  },

  /**
   * Fetch a single product by ID
   * GET /products/{id}
   */
  getProductById: async (id) => {
    return apiClient(`/products/${Number(id)}`);
  },

  /**
   * Register a new catalog product
   * POST /products
   * Strictly adheres to CreateProductDto: { name, description, creatBy }
   *  - name (string)
   *  - description (string)
   *  - creatBy (string - phone no of the register member)
   */
  createProduct: async (productData) => {
    const name = String(productData?.name || '').trim();
    const description = String(productData?.description || '').trim();
    const creatBy = String(
      productData?.creatBy ??
      productData?.createBy ??
      productData?.phnoNo ??
      productData?.phoneNo ??
      productData?.phoneNumber ??
      productData?.phone ??
      ''
    ).trim();

    if (!name) throw new Error('Product name is required.');
    if (!description) throw new Error('Product description is required.');
    if (!creatBy) throw new Error('Creator / Member phone number is required.');

    const payload = { name, description, creatBy };
    return apiClient('/products', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Update an existing product
   * PATCH /products/{id}
   * Strictly adheres to UpdateProductDto: { name, description, creatBy }
   */
  updateProduct: async (id, updateData) => {
    const payload = {};
    if (updateData?.name !== undefined) payload.name = String(updateData.name).trim();
    if (updateData?.description !== undefined) payload.description = String(updateData.description).trim();
    const phoneVal =
      updateData?.creatBy ??
      updateData?.createBy ??
      updateData?.phnoNo ??
      updateData?.phoneNo ??
      updateData?.phoneNumber ??
      updateData?.phone;
    if (phoneVal !== undefined) payload.creatBy = String(phoneVal).trim();

    return apiClient(`/products/${Number(id)}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  /**
   * Delete a product by ID
   * DELETE /products/{id}
   */
  deleteProduct: async (id) => {
    return apiClient(`/products/${Number(id)}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // 3. PURCHASES (INVENTORY INTAKE) API
  // ==========================================

  /**
   * Fetch all purchase records / batches
   * GET /purchase-products (with fallback to /purchases)
   * @returns {Promise<Array>} List of purchase batches
   */
  getPurchases: async () => {
    try {
      const data = await apiClient('/purchase-products');
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.purchases)) return data.purchases;
      return [];
    } catch (err) {
      try {
        const alt = await apiClient('/purchases');
        if (Array.isArray(alt)) return alt;
        if (Array.isArray(alt?.data)) return alt.data;
        if (Array.isArray(alt?.purchases)) return alt.purchases;
        return [];
      } catch {
        throw err;
      }
    }
  },

  /**
   * Fetch a single purchase record by ID
   * GET /purchase-products/{id}
   */
  getPurchaseById: async (id) => {
    return apiClient(`/purchase-products/${Number(id)}`);
  },

  /**
   * Register a new product purchase (creates a new Purchase Batch)
   * POST /purchase-products
   * Strictly adheres to CreatePurchaseProductDto:
   *  - productId (number)
   *  - supplierId (number)
   *  - purchaseDate (string ISO)
   *  - unitPrice (number - acquisition cost)
   *  - salePrice (number - target retail price)
   *  - totalPrice (number - total batch acquisition expenditure)
   *  - quantity (number - batch stock quantity)
   *  - purchaseBy (string - phone no of purchaser member)
   */
  createPurchase: async (purchaseData) => {
    const productId = parseInt(purchaseData?.productId, 10);
    const supplierId = parseInt(purchaseData?.supplierId, 10);
    const quantity = Math.max(1, parseInt(purchaseData?.quantity, 10) || 1);
    const unitPrice = Math.max(0, parseFloat(purchaseData?.unitPrice) || 0);
    const salePrice = Math.max(0, parseFloat(purchaseData?.salePrice) || 0);
    const totalPrice = Math.max(0, parseFloat(purchaseData?.totalPrice ?? (quantity * unitPrice)) || 0);
    const purchaseDate = purchaseData?.purchaseDate
      ? new Date(purchaseData.purchaseDate).toISOString()
      : new Date().toISOString();
    const purchaseBy = String(
      purchaseData?.purchaseBy ??
      purchaseData?.purchasedBy ??
      purchaseData?.phone ??
      purchaseData?.phoneNo ??
      ''
    ).trim();

    if (!productId || isNaN(productId)) {
      throw new Error('Valid Product selection is required.');
    }
    if (!supplierId || isNaN(supplierId)) {
      throw new Error('Valid Supplier selection is required.');
    }
    if (unitPrice <= 0) {
      throw new Error('Unit purchase cost must be greater than zero.');
    }
    if (salePrice <= 0) {
      throw new Error('Selling price per unit must be greater than zero.');
    }
    if (!purchaseBy) {
      throw new Error('Purchaser member phone number (Purchased By) is required.');
    }

    const payload = {
      productId,
      supplierId,
      purchaseDate,
      unitPrice,
      salePrice,
      totalPrice,
      quantity,
      purchaseBy,
    };

    return apiClient('/purchase-products', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Update an existing purchase batch
   * PATCH /purchase-products/{id}
   */
  updatePurchase: async (id, updateData) => {
    const payload = {};
    if (updateData?.productId !== undefined) payload.productId = parseInt(updateData.productId, 10);
    if (updateData?.supplierId !== undefined) payload.supplierId = parseInt(updateData.supplierId, 10);
    if (updateData?.purchaseDate !== undefined) payload.purchaseDate = new Date(updateData.purchaseDate).toISOString();
    if (updateData?.unitPrice !== undefined) payload.unitPrice = parseFloat(updateData.unitPrice);
    if (updateData?.salePrice !== undefined) payload.salePrice = parseFloat(updateData.salePrice);
    if (updateData?.totalPrice !== undefined) payload.totalPrice = parseFloat(updateData.totalPrice);
    if (updateData?.quantity !== undefined) payload.quantity = parseInt(updateData.quantity, 10);
    if (updateData?.purchaseBy !== undefined || updateData?.purchasedBy !== undefined) {
      payload.purchaseBy = String(updateData.purchaseBy ?? updateData.purchasedBy).trim();
    }

    return apiClient(`/purchase-products/${Number(id)}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  /**
   * Delete a purchase batch by ID
   * DELETE /purchase-products/{id}
   */
  deletePurchase: async (id) => {
    return apiClient(`/purchase-products/${Number(id)}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // 4. SALES (POS) API
  // ==========================================

  /**
   * Fetch all live sales records
   * GET /product-sales
   * @returns {Promise<Array>} List of sales transactions
   */
  getSales: async () => {
    const data = await apiClient('/product-sales');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.sales)) return data.sales;
    if (Array.isArray(data?.result)) return data.result;
    return [];
  },

  /**
   * Fetch a single sale record by ID
   * GET /product-sales/{id}
   */
  getSaleById: async (id) => {
    return apiClient(`/product-sales/${Number(id)}`);
  },

  /**
   * Record a new product sale transaction (POS)
   * POST /product-sales
   * Strictly adheres to CreateProductSaleDto:
   *  - productId (number)
   *  - purchaseProductId (number - purchase batch ID)
   *  - quantity (number)
   *  - unitPrice (number)
   *  - purchaseBy (string - phone no of member recording sale)
   */
  createSale: async (saleData) => {
    const productId = parseInt(saleData?.productId, 10);
    const purchaseProductId = parseInt(saleData?.purchaseProductId, 10);
    const quantity = Math.max(1, parseInt(saleData?.quantity, 10) || 1);
    const unitPrice = Math.max(0, parseFloat(saleData?.unitPrice ?? saleData?.salesPrice) || 0);
    const purchaseBy = String(
      saleData?.purchaseBy ??
      saleData?.customerPhone ??
      saleData?.phone ??
      saleData?.phoneNo ??
      ''
    ).trim();

    if (!productId || isNaN(productId)) {
      throw new Error('Valid Product selection is required.');
    }
    if (!purchaseProductId || isNaN(purchaseProductId)) {
      throw new Error('Valid Purchase Batch selection is required.');
    }
    if (unitPrice <= 0) {
      throw new Error('Unit sale price must be greater than zero.');
    }
    if (!purchaseBy) {
      throw new Error('Member contact phone number is required.');
    }

    const payload = {
      productId,
      purchaseProductId,
      quantity,
      unitPrice,
      purchaseBy,
    };

    return apiClient('/product-sales', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Retrieve formal financial performance report for a specific purchase batch
   * GET /product-sales/report/{purchaseProductId}
   * Returns profit, net income, and remaining stock.
   * @param {number|string} purchaseProductId - ID of the purchase batch
   * @returns {Promise<Object>} Report payload from backend
   */
  getBatchFinancialReport: async (purchaseProductId) => {
    const id = parseInt(purchaseProductId, 10);
    if (!id || isNaN(id)) {
      throw new Error('A valid Purchase Batch ID is required to generate the report.');
    }
    return apiClient(`/product-sales/report/${id}`);
  },

  /**
   * Backward-compatible alias for getBatchFinancialReport
   */
  getBatchProfitReport: async (purchaseProductId) => {
    return financeService.getBatchFinancialReport(purchaseProductId);
  },

  // ==========================================
  // 5. EXPENSES (OTHER COSTS) API
  // ==========================================

  /**
   * Fetch all operational / supplementary cost records
   * GET /other-costs
   * @returns {Promise<Array>} List of expense records
   */
  getExpenses: async () => {
    const data = await apiClient('/other-costs');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.costs)) return data.costs;
    return [];
  },

  /**
   * Fetch a single cost record by ID
   * GET /other-costs/{id}
   */
  getExpenseById: async (id) => {
    return apiClient(`/other-costs/${Number(id)}`);
  },

  /**
   * Register a new operational expense / cost
   * POST /other-costs
   * Strictly adheres to CreateOtherCostDto:
   *  - costName (string)
   *  - costDescription (string)
   *  - costAmount (number)
   *  - purchaseProductsId (number, optional)
   */
  createExpense: async (expenseData) => {
    const costName = String(expenseData.costName || '').trim();
    const costDescription = String(expenseData.costDescription || '').trim();
    const costAmount = Math.max(0.01, parseFloat(expenseData.costAmount) || 0);

    if (!costName) throw new Error('Cost category or name is required.');
    if (!costDescription) throw new Error('Cost description is required.');
    if (costAmount <= 0) throw new Error('Expense amount must be greater than zero.');

    const payload = {
      costName,
      costDescription,
      costAmount,
    };

    if (expenseData.purchaseProductsId !== undefined && expenseData.purchaseProductsId !== null && expenseData.purchaseProductsId !== '') {
      const pBatchId = parseInt(expenseData.purchaseProductsId, 10);
      if (!isNaN(pBatchId) && pBatchId > 0) {
        payload.purchaseProductsId = pBatchId;
      }
    }

    if (expenseData.purchaseBy) {
      payload.purchaseBy = String(expenseData.purchaseBy).trim();
    }

    return apiClient('/other-costs', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Update an existing cost record
   * PATCH /other-costs/{id}
   */
  updateExpense: async (id, updateData) => {
    const payload = {};
    if (updateData.costName !== undefined) payload.costName = String(updateData.costName).trim();
    if (updateData.costDescription !== undefined) payload.costDescription = String(updateData.costDescription).trim();
    if (updateData.costAmount !== undefined) payload.costAmount = parseFloat(updateData.costAmount);
    if (updateData.purchaseProductsId !== undefined) {
      payload.purchaseProductsId = parseInt(updateData.purchaseProductsId, 10);
    }
    if (updateData.purchaseBy !== undefined) {
      payload.purchaseBy = String(updateData.purchaseBy).trim();
    }

    return apiClient(`/other-costs/${Number(id)}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  /**
   * Delete an expense / cost record by ID
   * DELETE /other-costs/{id}
   */
  deleteExpense: async (id) => {
    return apiClient(`/other-costs/${Number(id)}`, {
      method: 'DELETE',
    });
  },
};
