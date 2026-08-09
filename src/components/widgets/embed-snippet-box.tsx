"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmbedSnippetBoxProps {
  widgetId: string;
  bundleVersion: number;
  themeSeed?: number;
}

export function EmbedSnippetBox({
  widgetId,
  bundleVersion,
  themeSeed,
}: EmbedSnippetBoxProps) {
  const [copied, setCopied] = useState(false);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const themeParam = themeSeed ? `&themeSeed=${themeSeed}` : "";
  const snippet = `<script src="${appUrl}/api/widget-bundle/v${bundleVersion}?id=${widgetId}${themeParam}"></script>`;

  async function handleCopy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-[#5b2f99] bg-[#15072d]/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          Embed snippet
        </p>
        <Button size="sm" variant="primary" onClick={handleCopy}>
          {copied ? (
            <Check size={14} className="mr-1" />
          ) : (
            <Copy size={14} className="mr-1" />
          )}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-md border border-[#4b2b82] bg-[#0d0116] p-3 font-mono text-xs text-green">
        {snippet}
      </pre>
    </div>
  );
}
