/**
 * Utility functions for making authenticated API requests
 */

interface FetchOptions extends RequestInit {
  headers?: HeadersInit;
}

/**
 * Makes an authenticated fetch request by automatically including the JWT token
 * from localStorage or sessionStorage
 * 
 * @param url - The API endpoint URL
 * @param options - Standard fetch options
 * @returns Promise with the fetch response
 * 
 * @example
 * ```typescript
 * const response = await authenticatedFetch('/api/teams');
 * const data = await response.json();
 * ```
 */
export async function authenticatedFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  if (!token) {
    // Redirigir al login
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      window.location.href = `/es/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    throw new Error('No se encontró token de autenticación');
  }

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * Makes an authenticated GET request and parses JSON response
 * 
 * @param url - The API endpoint URL
 * @returns Promise with the parsed JSON data
 */
export async function apiGet<T = any>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, { method: 'GET' });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
}

/**
 * Makes an authenticated POST request with JSON body
 * 
 * @param url - The API endpoint URL
 * @param data - The data to send in the request body
 * @returns Promise with the parsed JSON response
 */
export async function apiPost<T = any>(url: string, data: any): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
}

/**
 * Makes an authenticated PUT request with JSON body
 * 
 * @param url - The API endpoint URL
 * @param data - The data to send in the request body
 * @returns Promise with the parsed JSON response
 */
export async function apiPut<T = any>(url: string, data: any): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
}

/**
 * Makes an authenticated DELETE request
 * 
 * @param url - The API endpoint URL
 * @returns Promise with the parsed JSON response
 */
export async function apiDelete<T = any>(url: string): Promise<T> {
  const response = await authenticatedFetch(url, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }
  
  return response.json();
}
