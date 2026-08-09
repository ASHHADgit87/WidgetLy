import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { ApiResponse } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<
  NextResponse<ApiResponse<{ submissions: unknown[]; total: number }>>
> {
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

  const { id } = await params;
  const widgetId = id;

  const widget = await prisma.widget.findUnique({
    where: { id: widgetId },
    select: { id: true, tenantId: true, title: true },
  });

  if (!widget || widget.tenantId !== userId) {
    return NextResponse.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Widget not found" },
      },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { widgetId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.submission.count({ where: { widgetId } }),
  ]);

  return NextResponse.json({
    success: true,
    data: { submissions, total },
  });
}
