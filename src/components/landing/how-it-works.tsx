"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Rocket,
  Globe,
  ShieldCheck,
  MapPinned,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
  ring: string;
  bg: string;
  dot: string;
}
const steps: Step[] = [
  {
    number: "01",
    icon: Code2,
    title: "Create & configure",
    description:
      "Design your widget through the authenticated API — fields, button text, display rules.",
    accent: "text-[#caa3ff]",
    ring: "ring-[#caa3ff]/40",
    bg: "bg-[#caa3ff]/10",
    dot: "#caa3ff",
  },
  {
    number: "02",
    icon: ShieldCheck,
    title: "Submission protected",
    description:
      "Every payload is validated at the boundary, rate-limited per IP, and checked against a honeypot spam control.",
    accent: "text-green",
    ring: "ring-green/40",
    bg: "bg-green/10",
    dot: "#34c281",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Get the embed snippet",
    description:
      "One <script> tag is generated per widget — everything it needs flows from that single line.",
    accent: "text-[#8b6bff]",
    ring: "ring-[#8b6bff]/40",
    bg: "bg-[#8b6bff]/10",
    dot: "#8b6bff",
  },
  {
    number: "04",
    icon: MapPinned,
    title: "Geo-enriched, safely",
    description:
      "IP-to-location runs through a provider fallback chain — if both are down, the submission still succeeds.",
    accent: "text-[#6f9dfb]",
    ring: "ring-[#6f9dfb]/40",
    bg: "bg-[#6f9dfb]/10",
    dot: "#6f9dfb",
  },
  {
    number: "05",
    icon: Globe,
    title: "Paste it anywhere",
    description:
      "Drop it into any site you don't control. Config loads cached and CORS-safe, and the widget renders in place.",
    accent: "text-[#e0b7ff]",
    ring: "ring-[#e0b7ff]/30",
    bg: "bg-[#e0b7ff]/10",
    dot: "#e0b7ff",
  },
  {
    number: "06",
    icon: LayoutDashboard,
    title: "Live in your dashboard",
    description:
      "Stored, linked to the right tenant, and shown instantly with stats and geo breakdowns.",
    accent: "text-[#caa3ff]",
    ring: "ring-[#caa3ff]/40",
    bg: "bg-[#caa3ff]/10",
    dot: "#caa3ff",
  },
];

const FLOW_ORDER: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
];

const ARROW_GAP = 9;

interface PathData {
  id: string;
  d: string;
  color: string;
  fast: boolean;
}

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState<PathData[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const measure = () => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    setSvgSize({ width: containerRect.width, height: containerRect.height });

    const rects = cardRefs.current.map((el) =>
      el ? el.getBoundingClientRect() : null,
    );

    const next: PathData[] = [];

    FLOW_ORDER.forEach(([fromIdx, toIdx], i) => {
      const a = rects[fromIdx];
      const b = rects[toIdx];
      if (!a || !b) return;

      const color = steps[fromIdx]!.dot;
      const sameColumn = Math.floor(fromIdx / 2) === Math.floor(toIdx / 2);

      if (sameColumn) {
        const x1 = a.left - containerRect.left + a.width / 2;
        const y1 = a.bottom - containerRect.top;
        const x2 = b.left - containerRect.left + b.width / 2;
        const y2 = b.top - containerRect.top - ARROW_GAP;

        next.push({
          id: `p-${i}`,
          d: `M ${x1} ${y1} L ${x2} ${y2}`,
          color,
          fast: false,
        });
      } else {
        const x1 = a.right - containerRect.left;
        const y1 = a.top - containerRect.top + a.height / 2;
        const x2raw = b.left - containerRect.left;
        const y2 = b.top - containerRect.top + b.height / 2;
        const x2 = x2raw - ARROW_GAP;
        const midX = x1 + (x2raw - x1) / 2;

        next.push({
          id: `p-${i}`,
          d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
          color,
          fast: true,
        });
      }
    });

    setPaths(next);
  };

  useLayoutEffect(() => {
    const t = setTimeout(measure, 650);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => measure());
    if (containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, []);

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-24">
      <div className="mb-16 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-green">
          How it works
        </p>
        <h2 className="text-2xl font-semibold text-white">
          From config to captured lead — six steps
        </h2>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,107,255,0.14),transparent_70%)] blur-2xl" />

      <div ref={containerRef} className="relative">
        <svg
          className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
          width={svgSize.width}
          height={svgSize.height}
          style={{ overflow: "visible" }}
        >
          <defs>
            <marker
              id="flow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="4"
              refY="4"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#b18aff" />
            </marker>
          </defs>

          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              stroke={p.color}
              strokeWidth={2}
              strokeDasharray="6 8"
              fill="none"
              markerEnd="url(#flow-arrow)"
              className="flow-path"
            />
          ))}
        </svg>

        <div className="relative z-10 grid grid-cols-1 gap-x-8 gap-y-10 px-4 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-14 lg:grid-flow-col lg:grid-cols-3 lg:grid-rows-2 lg:px-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              onAnimationComplete={measure}
              whileHover={{ y: -6, scale: 1.015 }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              className="relative rounded-xl border border-[#5b2f99] bg-[#15072d]/80 p-4 shadow-[0_14px_60px_rgba(111,46,221,0.16)] transition-shadow hover:shadow-[0_20px_80px_rgba(139,107,255,0.28)] sm:p-6"
            >
              <span className="absolute right-5 top-5 font-mono text-3xl font-semibold text-white/10">
                {step.number}
              </span>
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ring-1 ${step.bg} ${step.ring}`}
              >
                <step.icon
                  className={`h-5 w-5 ${step.accent}`}
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="mb-2 text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/60">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .flow-path {
          animation: flow-dash 1.1s linear infinite;
        }
        @keyframes flow-dash {
          from {
            stroke-dashoffset: 32;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </section>
  );
}
