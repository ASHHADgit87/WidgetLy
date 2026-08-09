import type { ReactNode } from "react";

interface MonitorFrameProps {
  children: ReactNode;
}

export function MonitorFrame({ children }: MonitorFrameProps) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="rounded-[20px] border border-[#3a3a44] bg-[#2a2a32] p-3 shadow-[0_30px_90px_rgba(0,0,0,0.5)] sm:rounded-[28px] sm:p-4">
        <div className="overflow-hidden rounded-lg border border-[#4a4a56] bg-[#15072d] p-3 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] sm:rounded-xl sm:p-5 lg:p-8">
          <div className="overflow-x-auto">{children}</div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 sm:mt-3">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9b5cf0] sm:text-[10px]">
            WidgetLy
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#4a4a56]" />
        </div>
      </div>

      <div className="mx-auto h-8 w-20 bg-gradient-to-b from-[#2a2a32] to-[#232329] sm:h-10 sm:w-24" />

      <div className="mx-auto h-3 w-52 rounded-b-lg bg-[#2a2a32] shadow-[0_10px_30px_rgba(0,0,0,0.4)] sm:h-4 sm:w-64" />
    </div>
  );
}
