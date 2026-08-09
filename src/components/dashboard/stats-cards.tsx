"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  CalendarDays,
  LayoutGrid,
  Globe2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import type { DashboardStats } from "@/lib/db/submissions.repository";

interface StatsCardsProps {
  stats: DashboardStats;
}

interface CardDatum {
  label: string;
  value: string;
  accent: string;
  ring: string;
  bg: string;
  Icon: LucideIcon;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const last7DaysTotal = stats.submissionsLast7Days.reduce(
    (sum, day) => sum + day.count,
    0,
  );
  const topCountry = stats.geoBreakdown[0]?.country ?? "—";
  const activeWidgets = stats.perWidget.length;

  const cards: CardDatum[] = [
    {
      label: "Total submissions",
      value: stats.totalSubmissions.toString(),
      accent: "text-green",
      ring: "ring-green/30",
      bg: "bg-green/10",
      Icon: TrendingUp,
    },
    {
      label: "Last 7 days",
      value: last7DaysTotal.toString(),
      accent: "text-[#c19bff]",
      ring: "ring-[#c19bff]/30",
      bg: "bg-[#c19bff]/10",
      Icon: CalendarDays,
    },
    {
      label: "Widgets receiving traffic",
      value: activeWidgets.toString(),
      accent: "text-[#6f9dfb]",
      ring: "ring-[#6f9dfb]/30",
      bg: "bg-[#6f9dfb]/10",
      Icon: LayoutGrid,
    },
    {
      label: "Top country",
      value: topCountry,
      accent: "text-white",
      ring: "ring-white/15",
      bg: "bg-white/5",
      Icon: Globe2,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
        >
          <Card className="transition-shadow hover:shadow-[0_16px_60px_rgba(139,107,255,0.2)]">
            <CardHeader className="mb-0 flex-row items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40">
                  {card.label}
                </p>
                <p className={`mt-2 text-2xl font-semibold ${card.accent}`}>
                  {card.value}
                </p>
              </div>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${card.bg} ${card.ring}`}
              >
                <card.Icon
                  className={`h-4 w-4 ${card.accent}`}
                  strokeWidth={1.5}
                />
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
