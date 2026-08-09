import type { ReactNode } from "react";
import { AuthScene } from "@/components/three/auth-scene";
import { cn } from "@/lib/utils";

interface AuthPageShellProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
  className?: string;
}

export function AuthPageShell({
  children,
  maxWidth = "sm",
  className,
}: AuthPageShellProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[calc(100vh-73px)] items-center justify-center px-4 py-10 sm:px-6 sm:py-12",
        className,
      )}
    >
      <AuthScene />
      <div
        className={cn(
          "relative z-10 w-full",
          maxWidth === "lg"
            ? "max-w-2xl"
            : maxWidth === "md"
              ? "max-w-md"
              : "max-w-sm",
        )}
      >
        {children}
      </div>
    </section>
  );
}
