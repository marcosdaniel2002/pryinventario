export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Generic fetch wrapper for the StockHub API. Throws `ApiError` (with the
 * response status attached) on non-2xx responses so callers can react to
 * e.g. a 401 by logging out and redirecting.
 */
export async function apiFetch<T>(
  path: string,
  token?: string | null,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new ApiError(response.status, message || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Como `apiFetch`, pero para subir archivos: no fija `Content-Type` (el
 * browser arma el `multipart/form-data` con el boundary correcto solo).
 */
export async function apiUpload<T>(
  path: string,
  token: string | null | undefined,
  formData: FormData,
  method: "POST" | "PATCH" | "PUT" = "POST",
): Promise<T> {
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new ApiError(response.status, message || response.statusText);
  }

  return (await response.json()) as T;
}
