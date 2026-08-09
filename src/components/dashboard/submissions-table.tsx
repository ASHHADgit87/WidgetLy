"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Submission } from "@prisma/client";

interface SubmissionsTableProps {
  submissions: Submission[];
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  if (submissions.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-[#5b2f99] p-8 text-center text-sm text-white/40">
        No submissions yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#5b2f99] bg-[#15072d]/70">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[#5b2f99] bg-[#1f0a3d]/60 text-white/50">
          <tr>
            <th className="px-4 py-3 font-medium">Received</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Notification</th>
            <th className="px-4 py-3 font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission, i) => (
            <motion.tr
              key={submission.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04 }}
              className="border-b border-[#5b2f99]/50 last:border-0 hover:bg-[#1f0a3d]/40"
            >
              <td className="whitespace-nowrap px-4 py-3 text-white/70">
                {new Date(submission.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-white/70">
                {submission.geoFailed
                  ? "—"
                  : [submission.city, submission.region, submission.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={submission.notifySent ? "success" : "warning"}>
                  {submission.notifySent ? "Sent" : "Failed (non-blocking)"}
                </Badge>
              </td>
              <td className="max-w-md break-words px-4 py-3 font-mono text-xs text-white/40">
                {JSON.stringify(submission.data)}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
