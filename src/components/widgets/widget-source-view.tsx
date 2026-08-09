"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WidgetSourceViewProps {
  widgetId: string;
  bundleVersion: number;
  themeSeed?: number;
}

type SubTab = "script" | "config";

export function WidgetSourceView({
  widgetId,
  bundleVersion,
  themeSeed = 0,
}: WidgetSourceViewProps) {
  const [subTab, setSubTab] = useState<SubTab>("script");
  const [scriptText, setScriptText] = useState<string | null>(null);
  const [configText, setConfigText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const themeParam = themeSeed ? `?themeSeed=${themeSeed}` : "";
      const [scriptRes, configRes] = await Promise.all([
        fetch(`/api/widgets/${widgetId}/standalone-script${themeParam}`),
        fetch(`/api/widgets/${widgetId}/config`),
      ]);

      if (!scriptRes.ok || !configRes.ok) {
        throw new Error("Failed to load source");
      }

      const script = await scriptRes.text();
      const configJson = await configRes.json();

      setScriptText(script);
      setConfigText(JSON.stringify(configJson.data ?? configJson, null, 2));
    } catch {
      setError("Couldn't load the generated source. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [widgetId, bundleVersion, themeSeed]);

  async function handleCopy() {
    const text = subTab === "script" ? scriptText : configText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
      document.body.removeChild(textarea);
    }
  }

  const activeText = subTab === "script" ? scriptText : configText;

  return (
    <div className="rounded-lg border border-[#5b2f99] bg-[#15072d]/70 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="inline-flex rounded-md border border-[#4b2b82] bg-[#0d0116] p-0.5">
          <button
            type="button"
            onClick={() => setSubTab("script")}
            className={`rounded px-3 py-1 text-[11px] font-semibold transition ${
              subTab === "script"
                ? "bg-[#2a1046] text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Standalone script
          </button>
          <button
            type="button"
            onClick={() => setSubTab("config")}
            className={`rounded px-3 py-1 text-[11px] font-semibold transition ${
              subTab === "config"
                ? "bg-[#2a1046] text-white"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            Config payload
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={load} disabled={isLoading}>
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handleCopy}
            disabled={!activeText}
          >
            {copied ? (
              <Check size={14} className="mr-1" />
            ) : (
              <Copy size={14} className="mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-xs text-white/40">
          Loading generated source…
        </p>
      )}

      {!isLoading && error && (
        <p className="py-8 text-center text-xs text-[#ff9d9d]">{error}</p>
      )}

      {!isLoading && !error && activeText && (
        <pre className="max-h-[420px] overflow-auto rounded-md border border-[#4b2b82] bg-[#0d0116] p-3 font-mono text-[11px] leading-relaxed text-green">
          {activeText}
        </pre>
      )}
    </div>
  );
}
