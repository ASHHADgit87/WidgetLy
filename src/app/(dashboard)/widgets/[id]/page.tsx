import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getWidgetForTenant } from "@/lib/db/widgets.repository";
import { WidgetForm } from "@/components/widgets/widget-form";
import { WidgetResultTabs } from "@/components/widgets/widget-result-tabs";
import { AmbientBubbles } from "@/components/three/ambient-bubbles";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WidgetDetailPage({ params }: PageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;
  const widget = await getWidgetForTenant(id, userId);
  if (!widget) notFound();

  return (
    <div className="relative">
      <AmbientBubbles />

      <div className="relative z-10 max-w-2xl space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white">{widget.title}</h1>
            <p className="mt-1 text-sm text-white/50">
              Manage this widget and its embed snippet.
            </p>
          </div>
          <Link href={`/widgets/${widget.id}/submissions`}>
            <Button variant="secondary" size="sm">
              View submissions
            </Button>
          </Link>
        </div>

        <WidgetResultTabs
          widgetId={widget.id}
          bundleVersion={widget.bundleVersion}
        />

        <WidgetForm initialWidget={widget} />
      </div>
    </div>
  );
}
