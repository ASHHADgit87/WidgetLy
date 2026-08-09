import { prisma } from "./prisma";
import { Prisma } from "@prisma/client";
import type { Submission } from "@prisma/client";
import type { GeoResult } from "@/types";
import type { NotifyResult } from "@/lib/notifications/notify";

interface CreateSubmissionParams {
  widgetId: string;
  tenantId: string;
  data: Record<string, unknown>;
  ipAddress: string;
  geo: GeoResult;
}

export async function createSubmission(
  params: CreateSubmissionParams,
): Promise<Submission> {
  return prisma.submission.create({
    data: {
      widgetId: params.widgetId,
      tenantId: params.tenantId,
      data: params.data as Prisma.InputJsonValue,
      ipAddress: params.ipAddress,
      country: params.geo.country,
      region: params.geo.region,
      city: params.geo.city,
      geoProvider: params.geo.provider,
      geoFailed: params.geo.failed,
    },
  });
}

export async function attachNotifyResult(
  submissionId: string,
  result: NotifyResult,
): Promise<void> {
  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      notifySent: result.sent,
      notifyError: result.error,
    },
  });
}

export async function listSubmissionsForTenant(
  tenantId: string,
  options: { widgetId?: string; limit?: number; offset?: number } = {},
): Promise<Submission[]> {
  return prisma.submission.findMany({
    where: {
      tenantId,
      ...(options.widgetId && { widgetId: options.widgetId }),
    },
    orderBy: { createdAt: "desc" },
    take: options.limit ?? 50,
    skip: options.offset ?? 0,
  });
}

export interface DashboardStats {
  totalSubmissions: number;
  submissionsLast7Days: { date: string; count: number }[];
  perWidget: { widgetId: string; widgetTitle: string; count: number }[];
  geoBreakdown: { country: string; count: number }[];
}

export async function getDashboardStats(
  tenantId: string,
): Promise<DashboardStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalSubmissions, recentSubmissions, perWidgetRaw] = await Promise.all(
    [
      prisma.submission.count({ where: { tenantId } }),
      prisma.submission.findMany({
        where: { tenantId, createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true, country: true },
      }),
      prisma.submission.groupBy({
        by: ["widgetId"],
        where: { tenantId },
        _count: { _all: true },
      }),
    ],
  );

  const dayBuckets = new Map<string, number>();
  const countryBuckets = new Map<string, number>();

  for (const submission of recentSubmissions) {
    const day = submission.createdAt.toISOString().slice(0, 10);
    dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + 1);

    if (submission.country) {
      countryBuckets.set(
        submission.country,
        (countryBuckets.get(submission.country) ?? 0) + 1,
      );
    }
  }

  const widgetIds = perWidgetRaw.map((row: any) => row.widgetId);
  const widgets = await prisma.widget.findMany({
    where: { id: { in: widgetIds } },
    select: { id: true, title: true },
  });
  const titleById = new Map(widgets.map((w: any) => [w.id, w.title]));

  return {
    totalSubmissions,
    submissionsLast7Days: Array.from(dayBuckets.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    perWidget: perWidgetRaw.map((row: any) => ({
      widgetId: row.widgetId,
      widgetTitle: titleById.get(row.widgetId) ?? "Unknown widget",
      count: row._count._all,
    })),
    geoBreakdown: Array.from(countryBuckets.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count),
  };
}
