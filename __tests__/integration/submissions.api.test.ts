import { describe, it, expect } from "vitest";

const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const ALLOWED_ORIGIN = "http://127.0.0.1:8080";

describe("POST /api/submissions (requires dev server running)", () => {
  it("handles CORS preflight for an allowed origin", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "OPTIONS",
      headers: { Origin: ALLOWED_ORIGIN },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(
      ALLOWED_ORIGIN,
    );
  });

  it("rejects an invalid payload with 400, never 500", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
      body: JSON.stringify({ widgetId: "" }),
    });
    expect(response.status).toBe(400);
  });

  it("rejects an oversized payload with 413", async () => {
    
    const oversizedMessage = "a".repeat(15_000);
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
      body: JSON.stringify({
        widgetId: "seed-widget-1",
        data: { email: "a@b.com", message: oversizedMessage },
      }),
    });
    expect(response.status).toBe(413);
  });

  it("rejects a disallowed origin with 403", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://evil.example",
      },
      body: JSON.stringify({
        widgetId: "seed-widget-1",
        data: { email: "a@b.com" },
      }),
    });
    expect(response.status).toBe(403);
  });

  it("silently drops a honeypot-tripped submission", async () => {
    const response = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
      body: JSON.stringify({
        widgetId: "seed-widget-1",
        data: { email: "bot@bot.com", company_website: "http://spam.example" },
      }),
    });
    const json = await response.json();
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("returns 429 after exceeding the per-IP rate limit", async () => {
    const requests = Array.from({ length: 12 }, () =>
      fetch(`${BASE_URL}/api/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: ALLOWED_ORIGIN },
        body: JSON.stringify({
          widgetId: "seed-widget-1",
          data: { email: "burst@test.com" },
        }),
      }),
    );
    const responses = await Promise.all(requests);
    const statuses = responses.map((r) => r.status);
    expect(statuses).toContain(429);
  });
});
