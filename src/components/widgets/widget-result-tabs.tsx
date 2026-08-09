"use client";

import { useEffect, useState } from "react";
import { WidgetPreview } from "@/components/widgets/widget-preview";
import { EmbedSnippetBox } from "@/components/widgets/embed-snippet-box";
import { WidgetSourceView } from "@/components/widgets/widget-source-view";

interface WidgetResultTabsProps {
  widgetId: string;
  bundleVersion: number;
}

type Tab = "preview" | "embed" | "source";

const TABS: { key: Tab; label: string }[] = [
  { key: "preview", label: "Preview" },
  { key: "embed", label: "Embed" },
  { key: "source", label: "Code" },
];

export function WidgetResultTabs({
  widgetId,
  bundleVersion,
}: WidgetResultTabsProps) {
  const [tab, setTab] = useState<Tab>("preview");

  const [themeSeed, setThemeSeed] = useState(0);
  const [initialThemeSeed, setInitialThemeSeed] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/widgets/${widgetId}`);
        const json = await res.json();
        if (mounted && json?.success && json.data?.themeSeed) {
          setThemeSeed(Number(json.data.themeSeed) || 0);
          setInitialThemeSeed(json.data.themeSeed);
        }
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, [widgetId]);

  useEffect(() => {
    if (initialThemeSeed === null) return;
    const current = String(themeSeed);
    if (current === initialThemeSeed) return;

    const t = setTimeout(() => {
      fetch(`/api/widgets/${widgetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeSeed: String(themeSeed) }),
      }).catch(() => {});
    }, 600);

    return () => clearTimeout(t);
  }, [themeSeed, widgetId, initialThemeSeed]);

  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border border-[#5b2f99] bg-[#15072d]/70 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
              tab === t.key
                ? "bg-gradient-to-r from-[#8d5cff] via-[#b184ff] to-[#dbaefd] text-[#12021f]"
                : "text-white/50 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "preview" && (
        <WidgetPreview
          widgetId={widgetId}
          bundleVersion={bundleVersion}
          themeSeed={themeSeed}
          onThemeSeedChange={setThemeSeed}
        />
      )}
      {tab === "embed" && (
        <EmbedSnippetBox widgetId={widgetId} bundleVersion={bundleVersion} themeSeed={themeSeed} />
      )}
      {tab === "source" && (
        <WidgetSourceView
          widgetId={widgetId}
          bundleVersion={bundleVersion}
          themeSeed={themeSeed}
        />
      )}
    </div>
  );
}
