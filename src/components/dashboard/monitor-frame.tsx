import type { ReactNode } from "react";

interface MonitorFrameProps {
  children: ReactNode;
}

export function MonitorFrame({ children }: MonitorFrameProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-[28px] border border-[#3a3a44] bg-[#2a2a32] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:p-6">
        <div className="overflow-hidden rounded-xl border border-[#4a4a56] bg-[#15072d] p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] sm:p-8">
          <div className="overflow-x-auto">{children}</div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9b5cf0]">
            WidgetLy
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#4a4a56]" />
        </div>
      </div>

      <div className="mx-auto h-10 w-24 bg-gradient-to-b from-[#2a2a32] to-[#232329]" />

      <div className="mx-auto h-4 w-64 rounded-b-lg bg-[#2a2a32] shadow-[0_10px_30px_rgba(0,0,0,0.4)]" />
    </div>
  );
}
