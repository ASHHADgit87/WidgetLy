"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetPreviewGlow } from "@/components/three/widget-preview-glow";

interface WidgetPreviewProps {
  widgetId: string;
  bundleVersion: number;
  themeSeed: number;
  onThemeSeedChange: (seed: number) => void;
}

const MIN_HEIGHT = 220;

export function WidgetPreview({
  widgetId,
  bundleVersion,
  themeSeed,
  onThemeSeedChange,
}: WidgetPreviewProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const [height, setHeight] = useState(MIN_HEIGHT);

  const srcDoc = useMemo(() => {
    const themeParam = themeSeed ? `&themeSeed=${themeSeed}` : "";
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background: #0d0116;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      body {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        box-sizing: border-box;
        padding: 40px 24px;
      }
    </style>
  </head>
  <body>
    <script src="${appUrl}/api/widget-bundle/v${bundleVersion}?id=${widgetId}${themeParam}"></script>
    <script>
      (function () {
        function reportHeight() {
          var h = document.body.scrollHeight;
          window.parent.postMessage({ type: 'widget-preview-height', height: h }, '*');
        }
        if (window.ResizeObserver) {
          var ro = new ResizeObserver(reportHeight);
          ro.observe(document.body);
        }
        window.addEventListener('load', reportHeight);
        setTimeout(reportHeight, 50);
        setTimeout(reportHeight, 400);
      })();
    </script>
  </body>
</html>`;
  }, [appUrl, bundleVersion, widgetId, themeSeed]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (
        data &&
        data.type === "widget-preview-height" &&
        typeof data.height === "number"
      ) {
        setHeight(Math.max(MIN_HEIGHT, data.height));
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border border-[#5b2f99] bg-[#0d0116]">
        <WidgetPreviewGlow />

        <div className="relative z-10 flex items-center gap-1.5 border-b border-[#5b2f99] bg-[#15072d]/90 px-3 py-2 backdrop-blur-sm">
          <span className="h-2 w-2 rounded-full bg-[#ff6b6b]/60" />
          <span className="h-2 w-2 rounded-full bg-[#f4d35b]/60" />
          <span className="h-2 w-2 rounded-full bg-green/60" />
          <span className="ml-2 font-mono text-[10px] text-white/30">
            Live preview — real embed bundle
          </span>
        </div>

        <iframe
          title="Widget preview"
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-same-origin allow-forms"
          scrolling="no"
          className="relative z-10 block w-full border-0 transition-[height] duration-200"
          style={{ height }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onThemeSeedChange(Math.random())}
          className="gap-1.5"
        >
          <Sparkles size={14} />
          New theme
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={async () => {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
            const url = `${appUrl}/api/widgets/${widgetId}/form${themeSeed ? `?themeSeed=${themeSeed}` : ""}`;
            await navigator.clipboard.writeText(url);
          }}
          className="gap-1.5"
        >
          Copy link
        </Button>
      </div>
    </div>
  );
}
