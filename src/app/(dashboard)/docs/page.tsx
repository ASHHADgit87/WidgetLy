import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DocsScene } from "@/components/three/docs-scene";
import { PipelineFlow } from "@/components/docs/pipeline-flow";
import { EndpointStack } from "@/components/docs/endpoint-stack";

const statusCodes = [
  { code: "200 / 201", meaning: "Submission or resource accepted and stored." },
  {
    code: "400",
    meaning: "Malformed or invalid JSON — rejected before validation runs.",
  },
  { code: "403", meaning: "Origin not in the allowed CORS list." },
  {
    code: "404",
    meaning: "Widget not found, inactive, or owned by another tenant.",
  },
  { code: "413", meaning: "Payload exceeds the maximum allowed size." },
  { code: "429", meaning: "Rate limit hit — retry after the window resets." },
];

export default async function DocsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-16">
      <div className="relative overflow-hidden rounded-2xl border border-[#5b2f99] bg-[#15072d]/70">
        <div className="pointer-events-none absolute inset-0">
          <DocsScene />
        </div>
        <div className="relative z-10 max-w-xl p-8">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ad8cff]">
            API reference
          </p>
          <h1 className="text-2xl font-semibold text-white">
            How submissions move through the system
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Every endpoint your widgets rely on, and the eight-stage pipeline
            every public submission passes through before it lands in your
            dashboard.
          </p>
        </div>
        <div className="h-[300px] w-full sm:h-[360px]" />
      </div>

      <div>
        <h2 className="mb-6 text-sm font-medium text-white/70">
          The hardened submission pipeline
        </h2>
        <PipelineFlow />
      </div>

      <EndpointStack />

      <div>
        <h2 className="mb-4 text-sm font-medium text-white/70">
          Response codes you&apos;ll see
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {statusCodes.map((item) => (
            <div
              key={item.code}
              className="rounded-lg border border-[#5b2f99] bg-[#15072d]/70 p-3 sm:p-4"
            >
              <span className="font-mono text-sm text-[#c9b3ff]">
                {item.code}
              </span>
              <p className="mt-1 text-xs text-white/55">{item.meaning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
