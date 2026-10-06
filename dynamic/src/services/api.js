export const API_BASE_URL =
    import.meta.env?.VITE_API_BASE_URL ||
    (typeof process !== 'undefined' ? process.env.REACT_APP_API_BASE_URL : null) ||
    "https://welude-birhan-1.onrender.com";

/**
 * Universal fetch wrapper for authorized requests
 */
export async function apiClient(endpoint, { method = 'GET', body, headers = {}, ...customConfig } = {}) {
    const token = localStorage.getItem('token');

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
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 204) {
        return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const errorMessage = Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message || data.error || `HTTP error! status: ${response.status}`;

        const error = new Error(errorMessage);
        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}