"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { RopeCanvas } from "@/components/landing/rope-canvas";

interface EndpointData {
  method: string;
  path: string;
  description: string;
  access: "Public · CORS" | "Authenticated";
  detail: string;
}

const ENDPOINTS: EndpointData[] = [
  {
    method: "GET",
    path: "/api/widgets/:id/config",
    description:
      "Public, cached widget config. Short-lived cache headers, small payload — served the way a CDN would.",
    access: "Public · CORS",
    detail:
      "Short max-age, revalidated often since an owner can edit a widget's config at any time.",
  },
  {
    method: "POST",
    path: "/api/submissions",
    description:
      "Public submission endpoint. Validates every field, rate-limits per IP and per widget, checks the honeypot, enriches with geo, and stores — all before the response returns.",
    access: "Public · CORS",
    detail:
      "The single most-attacked surface in the system — every protection layer runs on this route.",
  },
  {
    method: "GET",
    path: "/api/widget-bundle/:version",
    description:
      "Versioned widget JavaScript bundle. Cached long, immutable — bust the cache by publishing a new version.",
    access: "Public · CORS",
    detail:
      "Long, immutable max-age — the URL changes on release, so the response never has to.",
  },
  {
    method: "GET / POST",
    path: "/api/widgets",
    description:
      "Authenticated widget CRUD. Tenant-isolated — one account can never see another's widgets.",
    access: "Authenticated",
    detail:
      "Every query is scoped to the signed-in tenant at the database layer, not just the UI.",
  },
  {
    method: "GET",
    path: "/api/widgets/:id/submissions",
    description: "Owner-only submissions for a single widget, paginated.",
    access: "Authenticated",
    detail:
      "Backs the per-widget submissions page — 20 rows per page, newest first.",
  },
  {
    method: "GET",
    path: "/api/dashboard/stats",
    description:
      "Aggregate counts, per-widget stats, and geo breakdown across all your widgets.",
    access: "Authenticated",
    detail:
      "Powers the dashboard overview — counts over time, per-widget totals, geo distribution.",
  },
];

const accessStyles: Record<EndpointData["access"], string> = {
  "Public · CORS": "border-[#6f9dfb]/40 text-[#6f9dfb]",
  Authenticated: "border-purple/40 text-purple",
};

interface EndpointCardProps extends EndpointData {
  index: number;
  total: number;
  progress: MotionValue<number>;
  cardRef?: (el: HTMLDivElement | null) => void;
}

function EndpointCard({
  index,
  total,
  method,
  path,
  description,
  access,
  detail,
  progress,
  cardRef,
}: EndpointCardProps) {
  const targetScale = Math.pow(0.99, total - index);
  const range: [number, number] = [index / total, (index + 1) / total];
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="sticky top-0 flex h-[40vh] items-start justify-center px-4 pt-[8vh] sm:h-screen sm:px-6 sm:pt-[15vh]">
      <motion.div
        ref={cardRef}
        style={{
          scale,
          top: `calc(-6vh + ${index * 22}px)`,
        }}
        className="relative flex w-full max-w-5xl origin-top flex-col items-center gap-2 rounded-2xl border border-[#542184] bg-[#13051f]/80 p-5 text-center shadow-[0_20px_70px_rgba(112,70,238,0.12)] backdrop-blur-md min-h-[160px] sm:p-6 sm:min-h-[180px]"
      >
        <span className="font-mono text-xs text-white/30">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>

        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-mono ${accessStyles[access]}`}
        >
          {access}
        </span>

        <p className="mt-2 font-mono text-base text-green sm:text-lg">
          {method}
        </p>
        <h3 className="font-mono text-2xl font-semibold text-white sm:text-3xl">
          {path}
        </h3>

        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
          {description}
        </p>
        <p className="max-w-lg text-xs leading-relaxed text-white/40">
          {detail}
        </p>
      </motion.div>
    </div>
  );
}

export function EndpointStack() {
  const container = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });

  return (
    <section ref={container} className="relative">
      <div className="top-0 z-10 mx-auto max-w-2xl px-6 pb-2 pt-4 text-center">
        <h2 className="text-2xl font-semibold text-white">Endpoints</h2>
        <p className="mt-2 text-white/50">
          Every route your widgets and dashboard rely on.
        </p>
      </div>

      {ENDPOINTS.map((endpoint, i) => (
        <EndpointCard
          key={`${endpoint.method}-${endpoint.path}`}
          index={i}
          total={ENDPOINTS.length}
          progress={scrollYProgress}
          cardRef={(el) => (cardRefs.current[i] = el)}
          {...endpoint}
        />
      ))}

      <RopeCanvas
        progress={scrollYProgress}
        total={ENDPOINTS.length}
        cardRefs={cardRefs}
      />
    </section>
  );
}
