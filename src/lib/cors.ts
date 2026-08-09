const allowedOrigins = (process.env.ALLOWED_WIDGET_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
export function resolveAllowedOrigin(
  requestOrigin: string | null,
): string | null {
  if (!requestOrigin) return null;
  if (allowedOrigins.includes("*")) return "*";
  return allowedOrigins.includes(requestOrigin) ? requestOrigin : null;
}

export function buildCorsHeaders(
  requestOrigin: string | null,
): Record<string, string> {
  const allowed = resolveAllowedOrigin(requestOrigin);
  if (!allowed) return {};

  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function handleCorsPreflight(request: Request): Response {
  const origin = request.headers.get("origin");
  const headers = buildCorsHeaders(origin);

  if (Object.keys(headers).length === 0) {
    return new Response(null, { status: 403 });
  }

  return new Response(null, { status: 204, headers });
}
