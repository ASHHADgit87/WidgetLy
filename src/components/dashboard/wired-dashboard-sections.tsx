"use client";

import { useRef, useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SubmissionsTable } from "@/components/dashboard/submissions-table";
import { GeoBreakdownChart } from "@/components/dashboard/geo-breakdown-chart";
import { MonitorFrame } from "@/components/dashboard/monitor-frame";
import { PowerBoard } from "@/components/dashboard/power-board";
import { PowerWires } from "@/components/dashboard/power-wires";
import type { DashboardStats } from "@/lib/db/submissions.repository";
import type { Submission } from "@prisma/client";

interface WiredDashboardSectionsProps {
  stats: DashboardStats;
  recentSubmissions: Submission[];
}

export function WiredDashboardSections({
  stats,
  recentSubmissions,
}: WiredDashboardSectionsProps) {
  const monitorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const socketRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [powered, setPowered] = useState<boolean[]>([true, true, true]);

  const togglePower = (index: number) => {
    setPowered((prev) => prev.map((p, i) => (i === index ? !p : p)));
  };

  const sections = [
    { title: "Stats", content: <StatsCards stats={stats} /> },
    {
      title: "Recent submissions",
      content: <SubmissionsTable submissions={recentSubmissions} />,
    },
    {
      title: "Geo breakdown",
      content: <GeoBreakdownChart geoBreakdown={stats.geoBreakdown} />,
    },
  ];

  return (
    <div className="space-y-16">
      {sections.map((section, i) => (
        <div key={section.title}>
          <h2 className="mb-4 text-center text-sm font-semibold text-white/70">
            {section.title}
          </h2>
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-center">
            <div
              ref={(el) => {
                monitorRefs.current[i] = el;
              }}
              className="min-w-0 flex-1"
            >
              <MonitorFrame>
                {powered[i] ? (
                  section.content
                ) : (
                  <div className="flex h-40 flex-col items-center justify-center gap-2 text-white/20">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
                      No signal
                    </span>
                  </div>
                )}
              </MonitorFrame>
            </div>

            <PowerBoard
              powered={powered[i]!}
              onToggle={() => togglePower(i)}
              socketRef={(el) => {
                socketRefs.current[i] = el;
              }}
            />
          </div>
        </div>
      ))}

      <PowerWires
        monitorRefs={monitorRefs}
        socketRefs={socketRefs}
        poweredStates={powered}
      />
    </div>
  );
}
