import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createWidgetSchema } from "@/lib/validation/schemas";
import {
  createWidget,
  listWidgetsForTenant,
  WidgetLimitReachedError,
} from "@/lib/db/widgets.repository";
import type { ApiResponse } from "@/types";
import type { Widget } from "@prisma/client";

export async function GET(): Promise<NextResponse<ApiResponse<Widget[]>>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Sign in required" },
      },
      { status: 401 },
    );
  }

  const widgets = await listWidgetsForTenant(userId);
  return NextResponse.json({ success: true, data: widgets });
}

export async function POST(
  request: Request,
): Promise<NextResponse<ApiResponse<Widget>>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Sign in required" },
      },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_JSON",
          message: "Request body must be valid JSON",
        },
      },
      { status: 400 },
    );
  }

  const parsed = createWidgetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid widget payload",
          details: parsed.error.flatten(),
        },
      },
      { status: 400 },
    );
  }

  try {
    const widget = await createWidget(userId, parsed.data);
    return NextResponse.json({ success: true, data: widget }, { status: 201 });
  } catch (error) {
    if (error instanceof WidgetLimitReachedError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "WIDGET_LIMIT_REACHED",
            message: error.message,
          },
        },
        { status: 409 },
      );
    }
    throw error;
  }
}
