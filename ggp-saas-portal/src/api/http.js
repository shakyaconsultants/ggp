import { createApiError } from "../utils/errors";

export async function apiRequest(baseUrl, path, options = {}) {
  const {
    auth = true,
    tokenGetter,
    onUnauthorized,
    ...fetchOptions
  } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  if (auth && tokenGetter) {
    const token = tokenGetter();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${baseUrl}${path}`, { ...fetchOptions, headers });
  } catch {
    throw createApiError({
      status: 0,
      fallback: "Unable to reach the server. Check your connection and try again.",
    });
  }

  let data = null;
  const rawText = await res.text();

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (auth && res.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    throw createApiError({
      status: res.status,
      data,
      rawText,
    });
  }

  return data;
}
