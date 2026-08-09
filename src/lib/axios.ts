type FetchOpts = { headers?: HeadersInit } & RequestInit;

function getAuthHeader(): Record<string, string> | undefined {
  try {
    const token = globalThis.localStorage?.getItem("app_token");
    if (!token) return undefined;
    return { Authorization: `Bearer ${token}` };
  } catch {
    return undefined;
  }
}

async function request(path: string, opts: FetchOpts = {}) {
  const authHeader = getAuthHeader();

  function normalizeHeaders(h?: HeadersInit): Record<string, string> {
    if (!h) return {};
    if (h instanceof Headers) {
      const out: Record<string, string> = {};
      h.forEach((v, k) => (out[k] = v));
      return out;
    }
    if (Array.isArray(h)) {
      return Object.fromEntries(h as [string, string][]);
    }
    return h as Record<string, string>;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...normalizeHeaders(opts.headers),
    ...(authHeader ?? {}),
  };

  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401) {
    try {
      globalThis.localStorage?.removeItem("app_token");
      globalThis.localStorage?.removeItem("app_token_expires");
    } catch {}
  }
  const text = await res.text();
  try {
    return { status: res.status, data: text ? JSON.parse(text) : null };
  } catch {
    return { status: res.status, data: text };
  }
}

export const http = {
  get: (p: string) => request(p, { method: "GET" }),
  post: (p: string, body?: unknown) =>
    request(p, { method: "POST", body: JSON.stringify(body) }),
  put: (p: string, body?: unknown) =>
    request(p, { method: "PUT", body: JSON.stringify(body) }),
  patch: (p: string, body?: unknown) =>
    request(p, { method: "PATCH", body: JSON.stringify(body) }),
  del: (p: string) => request(p, { method: "DELETE" }),
};

export default http;
