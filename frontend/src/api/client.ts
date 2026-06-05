// base URL for all API calls — can be overridden with a .env file
const API_BASE =  (import.meta as any).env.VITE_API_URL ?? "http://localhost:5000/api";

// attach the user id header so the backend knows who is making the request
function getHeaders(): HeadersInit {
  const userId = localStorage.getItem("medapp-user-id");
  return {
    "Content-Type": "application/json",
    ...(userId ? { "x-user-id": userId } : {}),
  };
}

// generic fetch wrapper used by all the hooks in hooks.ts
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers ?? {}) },
  });

  // 204 No Content means success with no body (e.g. cancel appointment)
  if (res.status === 204) return null as T;

  const data = await res.json().catch(() => ({ error: "Unexpected server error" }));

  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }

  return data as T;
}
