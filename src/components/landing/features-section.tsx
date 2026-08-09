"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Shield,
  Gauge,
  Globe,
  Layers,
  Code2,
  Cloud,
  Bell,
  BarChart3,
  Lock,
  TestTube2,
} from "lucide-react";
import { RopeCanvas } from "./rope-canvas";

interface CardData {
  title: string;
  description: string;
  Icon: LucideIcon;
  accent: "green" | "purple" | "lightblue";
}

const CARDS: CardData[] = [
  {
    title: "Widget Management API",
    description:
      "Authenticated, tenant-isolated CRUD for creating and configuring signup forms, CTAs, and popovers.",
    Icon: Layers,
    accent: "green",
  },
  {
    title: "Embed Snippet Generation",
    description:
      "One <script> tag per widget wires up config fetch, rendering, and submission handling automatically.",
    Icon: Code2,
    accent: "purple",
  },
  {
    title: "Cached Widget Delivery",
    description:
      "Versioned JS bundles and short-lived config caching, served with the same discipline as a real CDN.",
    Icon: Gauge,
    accent: "lightblue",
  },
  {
    title: "Public Submission Endpoint",
    description:
      "Cross-origin requests handled correctly — CORS, preflight, and boundary validation on every field.",
    Icon: Globe,
    accent: "green",
  },
  {
    title: "Abuse Protection",
    description:
      "Per-IP and per-widget rate limiting, plus honeypot spam detection, stop floods before they land.",
    Icon: Shield,
    accent: "purple",
  },
  {
    title: "Geo Enrichment Fallback",
    description:
      "IP-to-location lookups try Provider A, then Provider B — and never block a submission if both are down.",
    Icon: Cloud,
    accent: "lightblue",
  },
  {
    title: "Safe Side Effects",
    description:
      "Confirmation emails and webhooks fire after storage. A failure there can never break the main path.",
    Icon: Bell,
    accent: "green",
  },
  {
    title: "Owner Dashboard & Analytics",
    description:
      "Submission counts over time, per-widget stats, and geo breakdowns for every widget owner.",
    Icon: BarChart3,
    accent: "purple",
  },
];
const accentClasses: Record<
  CardData["accent"],
  { text: string; ring: string; bg: string }
> = {
  green: {
    text: "text-[#c19bff]",
    ring: "ring-[#c19bff]/10",
    bg: "bg-[#c19bff]/10",
  },
  purple: {
    text: "text-[#e2c6ff]",
    ring: "ring-[#e2c6ff]/15",
    bg: "bg-[#e2c6ff]/10",
  },
  lightblue: {
    text: "text-[#a18eff]",
    ring: "ring-[#a18eff]/10",
    bg: "bg-[#a18eff]/10",
  },
};

interface StackCardProps extends CardData {
  index: number;
  total: number;
  progress: MotionValue<number>;
  cardRef?: (el: HTMLDivElement | null) => void;
}

function StackCard({
  index,
  total,
  title,
  description,
  Icon,
  accent,
  progress,
  cardRef,
}: StackCardProps) {
  const targetScale = Math.pow(0.99, total - index);
  const range: [number, number] = [index / total, (index + 1) / total];
  const scale = useTransform(progress, range, [1, targetScale]);
  const colors = accentClasses[accent];

  return (
    <div className="sticky top-0 flex h-[50vh] items-start justify-center px-4 pt-[10vh] sm:h-screen sm:px-6 sm:pt-[15vh]">
      <motion.div
        ref={cardRef}
        style={{
          scale,
          top: `calc(-6vh + ${index * 22}px)`,
        }}
        className="relative flex w-full max-w-6xl origin-top flex-col gap-4 rounded-2xl border border-[#542184] bg-[#13051f]/80 p-5 shadow-[0_20px_70px_rgba(112,70,238,0.12)] backdrop-blur-md sm:flex-row sm:items-start sm:p-8 lg:p-10 min-h-[200px] sm:min-h-[235px]"
      >
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-1 ${colors.bg} ${colors.ring}`}
        >
          <Icon className={`h-6 w-6 ${colors.text}`} strokeWidth={1.5} />
        </div>

        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-xs text-white/30">
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-white sm:text-xl">
            {title}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-white/60 sm:text-sm">
            {description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function FeaturesSection() {
  const container = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end start"],
  });

  return (
    <section id="features" ref={container} className="relative">
      <div className="top-0 z-10 mx-auto max-w-5xl px-6 pb-2 pt-12 text-center">
        <h2 className="text-2xl font-semibold text-white">
          Built for untrusted traffic
        </h2>
        <p className="mt-2 text-white/50">
          The public internet is the input. Every layer assumes that.
        </p>
      </div>

      {CARDS.map((card, i) => (
        <StackCard
          key={card.title}
          index={i}
          total={CARDS.length}
          progress={scrollYProgress}
          cardRef={(el) => (cardRefs.current[i] = el)}
          {...card}
        />
      ))}

      <RopeCanvas
        progress={scrollYProgress}
        total={CARDS.length}
        cardRefs={cardRefs}
      />
    </section>
  );
}
