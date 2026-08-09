import { NextResponse } from "next/server";
import { getWidgetById } from "@/lib/db/widgets.repository";
import { buildCorsHeaders, handleCorsPreflight } from "@/lib/cors";
import type { WidgetPublicConfig } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleCorsPreflight(request);
}

export async function GET(
  request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const origin = request.headers.get("origin");
  const corsHeaders = buildCorsHeaders(origin);

  const { id } = await params;
  const widget = await getWidgetById(id);

  if (!widget || !widget.isActive) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Widget not found or inactive" },
      },
      { status: 404, headers: corsHeaders },
    );
  }

  const config: WidgetPublicConfig = {
    id: widget.id,
    type: widget.type,
    title: widget.title,
    description: widget.description,
    buttonText: widget.buttonText,
    fields: widget.fields as unknown as WidgetPublicConfig["fields"],
    displayOptions:
      widget.displayOptions as unknown as WidgetPublicConfig["displayOptions"],
    honeypotFieldName: widget.honeypotFieldName,
    bundleVersion: widget.bundleVersion,
  };

  return NextResponse.json(
    { success: true, data: config },
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control":
          "public, max-age=60, s-maxage=60, stale-while-revalidate=30",
      },
    },
  );
}
