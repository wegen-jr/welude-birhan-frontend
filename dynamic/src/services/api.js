const DEFAULT_BASE_URL = 'https://welude-birhan-1.onrender.com';
const envBase = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (envBase && typeof envBase === 'string' && envBase !== 'undefined' && envBase.trim())
  ? envBase.trim().replace(/\/+$/, '')
  : DEFAULT_BASE_URL;

/**
 * Universal fetch wrapper for authorized requests with Render cold-start handling
 */
export async function apiClient(endpoint, { method = 'GET', body, headers = {}, retries = 1, ...customConfig } = {}) {
    const rawToken = localStorage.getItem('token');
    const token = (rawToken && rawToken !== 'undefined' && rawToken !== 'null' && rawToken.trim())
        ? rawToken.trim()
        : null;

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${cleanEndpoint}`;

    const config = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...headers,
        },
        ...customConfig,
    };

    if (body) {
        config.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
        console.log(`[API ${method}] ${url}`);
        const response = await fetch(url, config);

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        let data;

        if (contentType.includes('application/json')) {
            data = await response.json().catch(() => ({}));
        } else {
            const rawText = await response.text();
            try {
                data = JSON.parse(rawText);
            } catch {
                // If the response returned HTML (e.g. Vite SPA fallback or Render cold-start/error page)
                if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
                    if (response.ok) {
                        throw new Error(`Endpoint returned HTML page instead of JSON. Check backend URL (${url})`);
                    } else {
                        throw new Error(`Server returned HTML error (${response.status}): ${rawText.slice(0, 150)}...`);
                    }
                }
                data = { message: rawText };
            }
        }

        if (!response.ok) {
            // Automatic retry once for Render cold-starts (502 / 503 / 504) on GET requests
            if (retries > 0 && method === 'GET' && [502, 503, 504].includes(response.status)) {
                console.warn(`[API] Render cold-start detected (${response.status}) on ${url}. Retrying in 2.5s...`);
                await new Promise((resolve) => setTimeout(resolve, 2500));
                return apiClient(endpoint, { method, body, headers, retries: retries - 1, ...customConfig });
            }

            const errorMessage = Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message || data.error || `HTTP error! status: ${response.status}`;

            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        // Automatic retry for network drops or cold-start fetch failures on GET requests
        if (retries > 0 && method === 'GET' && (err.name === 'TypeError' || err.message?.includes('Failed to fetch'))) {
            console.warn(`[API] Network failure on ${url}. Retrying in 2.5s...`);
            await new Promise((resolve) => setTimeout(resolve, 2500));
            return apiClient(endpoint, { method, body, headers, retries: retries - 1, ...customConfig });
        }
        console.error(`[API Error] ${method} ${url}:`, err);
        throw err;
    }
}

export const api = {
    get: (endpoint, config) => apiClient(endpoint, { method: 'GET', ...config }),
    post: (endpoint, body, config) => apiClient(endpoint, { method: 'POST', body, ...config }),
    put: (endpoint, body, config) => apiClient(endpoint, { method: 'PUT', body, ...config }),
    patch: (endpoint, body, config) => apiClient(endpoint, { method: 'PATCH', body, ...config }),
    delete: (endpoint, config) => apiClient(endpoint, { method: 'DELETE', ...config }),
};