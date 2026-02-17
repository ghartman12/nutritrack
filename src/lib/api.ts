export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const userId =
    typeof window !== "undefined"
      ? localStorage.getItem("nutritrack_user_id")
      : null;

  const headers = new Headers(options.headers);
  if (userId) {
    headers.set("x-user-id", userId);
  }

  return fetch(url, { ...options, headers });
}
