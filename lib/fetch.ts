/**
 * Fetch wrapper dengan auto-retry untuk expired token
 * Gunakan ini untuk semua API calls di client-side
 */

type FetchOptions = RequestInit & {
  retry?: boolean;
};

/**
 * Enhanced fetch dengan handling untuk expired tokens
 * Auto-redirect ke login jika 401 (unauthorized)
 */
export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
  const { retry = true, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    // Handle 401 Unauthorized (expired token)
    if (response.status === 401) {
      // Dispatch event untuk trigger auto-logout
      window.dispatchEvent(new Event('auth:unauthorized'));

      // Jika retry enabled, tunggu sebentar dan coba lagi
      if (retry) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fetchWithAuth(url, { ...options, retry: false });
      }

      throw new Error('Session expired. Please login again.');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Convenience method untuk GET requests
 */
export async function get<T = any>(url: string): Promise<T> {
  const response = await fetchWithAuth(url);
  return response.json();
}

/**
 * Convenience method untuk POST requests
 */
export async function post<T = any>(url: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * Convenience method untuk PUT requests
 */
export async function put<T = any>(url: string, data?: any): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * Convenience method untuk DELETE requests
 */
export async function del<T = any>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
  });
  return response.json();
}
