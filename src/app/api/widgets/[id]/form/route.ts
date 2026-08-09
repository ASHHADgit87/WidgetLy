import { NextResponse } from "next/server";
import { getWidgetById } from "@/lib/db/widgets.repository";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: RouteContext,
): Promise<Response> {
  const { id } = await params;
  const widget = await getWidgetById(id);
  if (!widget || !widget.isActive) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Widget not found or inactive" },
      },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const themeSeedParam = url.searchParams.get("themeSeed");
  const scriptUrl = `${url.origin}/api/widgets/${widget.id}/standalone-script${themeSeedParam ? `?themeSeed=${themeSeedParam}` : ""}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${widget.title}</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      overflow: auto;
      background: #0d0116;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  <script src="${scriptUrl}"></script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
