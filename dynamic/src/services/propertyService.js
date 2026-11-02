import { API_BASE_URL, apiClient } from './api';

/**
 * propertyService.js
 * 
 * Comprehensive, isolated service layer for Property & Inventory / Asset Management.
 * Strictly decoupled from Finance & Sales modules to ensure zero logic collision.
 * 
 * Conforms to the live backend Swagger specification:
 * - GET    /assets              - Fetch all registered assets
 * - POST   /assets              - Register a new asset (CreateAssetDto)
 * - GET    /assets/{id}         - Fetch single asset by UUID
 * - PATCH  /assets/{id}         - Update asset details (UpdateAssetDto)
 * - DELETE /assets/{id}         - Remove an asset record
 * - PATCH  /assets/{id}/decrement - Decrease quantity (DecrementAssetDto: { amount })
 */

/**
 * Helper to retrieve stored auth token for requests
 */
function getAuthToken() {
  const rawToken = localStorage.getItem('token');
  return (rawToken && rawToken !== 'undefined' && rawToken !== 'null' && rawToken.trim())
    ? rawToken.trim()
    : null;
}

/**
 * Dedicated Property HTTP Client (Axios-compatible interface)
 * Automatically attaches Authorization: Bearer <token> header to every property request.
 */
export const propertyApiClient = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  return apiClient(endpoint, {
    ...options,
    headers,
  });
};

/**
 * Axios-compatible instance interface for Property API
 */
export const propertyAxiosInstance = {
  get: (url, config = {}) => propertyApiClient(url, { method: 'GET', ...config }),
  post: (url, data, config = {}) => propertyApiClient(url, { method: 'POST', body: data, ...config }),
  patch: (url, data, config = {}) => propertyApiClient(url, { method: 'PATCH', body: data, ...config }),
  put: (url, data, config = {}) => propertyApiClient(url, { method: 'PUT', body: data, ...config }),
  delete: (url, config = {}) => propertyApiClient(url, { method: 'DELETE', ...config }),
};

export const propertyService = {
  // Underlying client
  client: propertyAxiosInstance,

  /**
   * Fetch all registered assets from live backend
   * GET /assets
   * @returns {Promise<Array>} List of assets
   */
  getAssets: async () => {
    const data = await propertyApiClient('/assets', { method: 'GET' });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.assets)) return data.assets;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  },

  /**
   * Fetch a single asset by ID (UUID)
   * GET /assets/{id}
   * @param {string} id - Asset UUID
   * @returns {Promise<Object>} Asset details
   */
  getAssetById: async (id) => {
    if (!id) throw new Error('Asset ID is required.');
    return propertyApiClient(`/assets/${id}`, { method: 'GET' });
  },

  /**
   * Register a new asset into inventory
   * POST /assets
   * Strictly adheres to CreateAssetDto:
   *  - name (string, required)
   *  - description (string, optional)
   *  - type (string, required, e.g. "ELECTRONICS", "FURNITURE", "INSTRUMENT", "BOOK", "VEHICLE", "OTHER")
   *  - value (number, required)
   *  - quantity (number, required)
   *  - status (string, enum: ["ACTIVE", "MAINTENANCE", "RETIRED"], default: "ACTIVE")
   *  - recordedByPhone / purchaseBy (string, optional custodian member phone)
   * @param {Object} assetData
   */
  createAsset: async (assetData) => {
    const name = String(assetData?.name ?? assetData?.productName ?? assetData?.assetName ?? '').trim();
    const type = String(assetData?.type ?? assetData?.category ?? 'EQUIPMENT').trim().toUpperCase();
    const quantity = parseInt(assetData?.quantity ?? assetData?.stockQuantity, 10);
    const value = parseFloat(assetData?.value ?? assetData?.purchasePrice ?? assetData?.price ?? assetData?.cost);
    const description = String(assetData?.description ?? '').trim();
    const status = String(assetData?.status || 'ACTIVE').toUpperCase();

    // Optional member / custodian phone number if provided or required by backend
    const recordedByPhone = String(
      assetData?.recordedByPhone ??
      assetData?.purchaseBy ??
      assetData?.purchasedBy ??
      assetData?.memberPhone ??
      assetData?.phone ??
      ''
    ).trim();

    if (!name) {
      throw new Error('Asset name is required.');
    }
    if (!type) {
      throw new Error('Asset type / category is required.');
    }
    if (isNaN(quantity) || quantity < 0) {
      throw new Error('Asset quantity must be a non-negative integer.');
    }
    if (isNaN(value) || value < 0) {
      throw new Error('Asset monetary value must be a non-negative number.');
    }

    const payload = {
      name,
      description,
      type,
      value,
      status: ['ACTIVE', 'MAINTENANCE', 'RETIRED'].includes(status) ? status : 'ACTIVE',
      quantity,
    };

    // Attach custodian phone if provided
    if (recordedByPhone) {
      payload.recordedByPhone = recordedByPhone;
      payload.purchaseBy = recordedByPhone;
    }

    return propertyApiClient('/assets', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Update an existing asset by ID
   * PATCH /assets/{id}
   * Strictly adheres to UpdateAssetDto
   * @param {string} id - Asset UUID
   * @param {Object} updateData
   */
  updateAsset: async (id, updateData) => {
    if (!id) throw new Error('Asset ID is required.');

    const payload = {};
    if (updateData?.name !== undefined || updateData?.productName !== undefined) {
      payload.name = String(updateData.name ?? updateData.productName).trim();
    }
    if (updateData?.description !== undefined) {
      payload.description = String(updateData.description).trim();
    }
    if (updateData?.type !== undefined || updateData?.category !== undefined) {
      payload.type = String(updateData.type ?? updateData.category).trim().toUpperCase();
    }
    if (updateData?.value !== undefined || updateData?.purchasePrice !== undefined || updateData?.price !== undefined) {
      payload.value = parseFloat(updateData.value ?? updateData.purchasePrice ?? updateData.price);
    }
    if (updateData?.quantity !== undefined || updateData?.stockQuantity !== undefined) {
      payload.quantity = parseInt(updateData.quantity ?? updateData.stockQuantity, 10);
    }
    if (updateData?.status !== undefined) {
      const st = String(updateData.status).toUpperCase();
      if (['ACTIVE', 'MAINTENANCE', 'RETIRED'].includes(st)) {
        payload.status = st;
      }
    }
    if (updateData?.recordedByPhone || updateData?.purchaseBy) {
      payload.recordedByPhone = String(updateData.recordedByPhone || updateData.purchaseBy).trim();
    }

    return propertyApiClient(`/assets/${id}`, {
      method: 'PATCH',
      body: payload,
    });
  },

  /**
   * Decrease asset quantity (e.g. when items break, expire, or are consumed)
   * PATCH /assets/{id}/decrement
   * Strictly adheres to DecrementAssetDto: { amount: number }
   * @param {string} id - Asset UUID
   * @param {number} amount - Quantity to deduct
   */
  decrementAsset: async (id, amount) => {
    if (!id) throw new Error('Asset ID is required.');
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new Error('Decrement amount must be a positive integer.');
    }

    return propertyApiClient(`/assets/${id}/decrement`, {
      method: 'PATCH',
      body: { amount: parsedAmount },
    });
  },

  /**
   * Delete an asset by ID
   * DELETE /assets/{id}
   * @param {string} id - Asset UUID
   */
  deleteAsset: async (id) => {
    if (!id) throw new Error('Asset ID is required.');
    return propertyApiClient(`/assets/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Compute live summary metrics from asset catalog
   * Zero mock data: calculated exclusively from live API records
   * @param {Array} assetsList - List of live assets
   */
  calculateMetrics: (assetsList = []) => {
    const list = Array.isArray(assetsList) ? assetsList : [];
    const totalAssets = list.length;
    const totalUnits = list.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);
    const totalValuation = list.reduce((sum, item) => {
      const q = Number(item?.quantity) || 0;
      const v = Number(item?.value ?? item?.purchasePrice ?? 0);
      return sum + (q * v);
    }, 0);
    const lowStockWarnings = list.filter((item) => Number(item?.quantity) <= 5).length;

    return {
      totalAssets,
      totalUnits,
      totalValuation,
      lowStockWarnings,
    };
  },

  // ==========================================
  // Backward compatibility aliases
  // ==========================================
  getProducts: async () => propertyService.getAssets(),
  getProductById: async (id) => propertyService.getAssetById(id),
  createProduct: async (data) => propertyService.createAsset(data),
  updateProduct: async (id, data) => propertyService.updateAsset(id, data),
  deleteProduct: async (id) => propertyService.deleteAsset(id),
};
