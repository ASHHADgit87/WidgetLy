"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Submission } from "@prisma/client";

interface WidgetSubmissionsTableProps {
  submissions: Submission[];
  total: number;
  widgetId: string;
  page: number;
}

const PAGE_SIZE = 20;

export function WidgetSubmissionsTable({
  submissions,
  total,
  widgetId,
  page,
}: WidgetSubmissionsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-[#5b2f99] bg-[#15072d]/70 p-10 text-center">
        <p className="text-sm text-white/50">
          No submissions yet for this widget. Once visitors start submitting,
          they&apos;ll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#5b2f99] bg-[#15072d]/70">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#5b2f99] text-white/50">
              <th className="px-4 py-3 font-medium">Received</th>
              <th className="px-4 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => {
              const isOpen = expandedId === sub.id;
              const entries = Object.entries(sub.data ?? {});
              const preview = entries
                .slice(0, 2)
                .map(([k, v]) => `${k}: ${String(v)}`)
                .join(" · ");
              const location = sub.city
                ? `${sub.city}, ${sub.country ?? ""}`
                : (sub.country ?? "—");

              return (
                <motion.tr
                  key={sub.id}
                  layout
                  onClick={() => setExpandedId(isOpen ? null : sub.id)}
                  className="cursor-pointer border-b border-[#5b2f99]/50 text-white/80 transition hover:bg-[#1f0a3d]/60"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-white/60">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {isOpen ? (
                      <div className="space-y-1">
                        {entries.map(([k, v]) => (
                          <div key={k} className="text-xs">
                            <span className="text-[#c19bff]">{k}:</span>{" "}
                            <span className="text-white/70">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-white/70">{preview || "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60">{location}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/40">
                    {sub.ipAddress ?? "—"}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-white/50">
          <span>
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <a
              href={`/widgets/${widgetId}/submissions?page=${Math.max(1, page - 1)}`}
              className={`rounded-md border border-[#5b2f99] px-3 py-1 transition hover:bg-[#1f0a3d]/60 ${
                page <= 1 ? "pointer-events-none opacity-30" : ""
              }`}
            >
              Previous
            </a>
            <a
              href={`/widgets/${widgetId}/submissions?page=${Math.min(totalPages, page + 1)}`}
              className={`rounded-md border border-[#5b2f99] px-3 py-1 transition hover:bg-[#1f0a3d]/60 ${
                page >= totalPages ? "pointer-events-none opacity-30" : ""
              }`}
            >
              Next
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
