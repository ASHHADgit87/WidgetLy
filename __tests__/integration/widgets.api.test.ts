import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

describe("GET /api/widgets (requires dev server running)", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const response = await fetch(`${BASE_URL}/api/widgets`);
    expect(response.status).toBe(401);
  });
});

describe("GET /api/widgets/:id (tenant isolation)", () => {
  it("returns 401 for a request without a session cookie, regardless of widget ownership", async () => {
    const response = await fetch(`${BASE_URL}/api/widgets/seed-widget-1`);
    expect(response.status).toBe(401);
  });
});
describe("OPTIONS /api/widgets/:id/config (CORS preflight)", () => {
  it("answers preflight for an allowed origin with 204 and CORS headers", async () => {
    const response = await fetch(
      `${BASE_URL}/api/widgets/seed-widget-1/config`,
      {
        method: "OPTIONS",
        headers: { Origin: "http://127.0.0.1:8080" },
      },
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      "http://127.0.0.1:8080",
    );
  });

  it("rejects preflight for a disallowed origin", async () => {
    const response = await fetch(
      `${BASE_URL}/api/widgets/seed-widget-1/config`,
      {
        method: "OPTIONS",
        headers: { Origin: "http://evil.example" },
      },
    );
    expect(response.status).toBe(403);
  });
});

describe("GET /api/widget-bundle/:version (successful widget rendering)", () => {
  it("serves a valid, executable JS bundle for an active widget", async () => {
    const response = await fetch(
      `${BASE_URL}/api/widget-bundle/v1?id=seed-widget-1`,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(
      "application/javascript",
    );

    const script = await response.text();

    expect(script).toContain("widgetId");
    expect(script).toContain("apiBase");
  });
});
