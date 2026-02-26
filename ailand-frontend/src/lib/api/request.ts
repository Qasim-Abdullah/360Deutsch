const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function publicApiRequest(
  url: string,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(BASE_URL + url, {
    ...options,
    headers,
  });
}