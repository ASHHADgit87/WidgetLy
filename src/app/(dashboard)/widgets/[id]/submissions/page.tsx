import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { WidgetOrb } from "@/components/three/widget-orb";
import { WidgetSubmissionsTable } from "@/components/widgets/widget-submissions-table";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

interface WidgetSubmissionsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function WidgetSubmissionsPage({
  params,
  searchParams,
}: WidgetSubmissionsPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { id } = await params;
  const { page: pageParam } = await searchParams;

  const widget = await prisma.widget.findUnique({
    where: { id },
    select: { id: true, title: true, tenantId: true },
  });

  if (!widget || widget.tenantId !== userId) notFound();

  const page = Math.max(1, Number(pageParam ?? "1"));

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where: { widgetId: widget.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.submission.count({ where: { widgetId: widget.id } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <Link href={`/widgets/${widget.id}`}>
        <Button variant="ghost" className="mb-6">
          ← Back to widget
        </Button>
      </Link>

      <div className="mb-6 flex items-center gap-3 sm:mb-8">
        <WidgetOrb />
        <div>
          <p className="mb-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#ad8cff] sm:text-[10px]">
            Submissions
          </p>
          <h1 className="text-xl font-semibold text-white sm:text-2xl">
            {widget.title}
          </h1>
          <p className="text-xs text-white/50 sm:text-sm">
            {total} submission{total === 1 ? "" : "s"} captured
          </p>
        </div>
      </div>

      <WidgetSubmissionsTable
        submissions={submissions}
        total={total}
        widgetId={widget.id}
        page={page}
      />
    </div>
  );
}
