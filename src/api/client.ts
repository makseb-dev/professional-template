const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const AGENCY_ID = import.meta.env.VITE_AGENCY_ID ?? '';

export { API_URL, AGENCY_ID };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let fieldErrors: { field: string; message: string }[] | undefined;
    try {
      const body = await res.json();
      if (Array.isArray(body)) {
        fieldErrors = body;
        message = body.map((e) => e.message).join('; ');
      } else if (body?.message) {
        message = Array.isArray(body.message)
          ? body.message.join('; ')
          : String(body.message);
      }
    } catch {
      /* ignore parse errors */
    }
    const err = new Error(message) as Error & {
      status?: number;
      fieldErrors?: { field: string; message: string }[];
    };
    err.status = res.status;
    err.fieldErrors = fieldErrors;
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
