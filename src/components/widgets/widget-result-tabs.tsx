"use client";

import { useState } from "react";
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

  return (
    <div>
      <div className="mb-2.5 inline-flex rounded-lg border border-[#5b2f99] bg-[#15072d]/70 p-1 sm:mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
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
        <EmbedSnippetBox widgetId={widgetId} bundleVersion={bundleVersion} />
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
