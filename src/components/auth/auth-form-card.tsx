import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const authCardClassName =
  "rounded-2xl border border-[#5b2f99] bg-[#15072d]/85 backdrop-blur-md shadow-[0_10px_40px_rgba(130,70,255,0.2)]";

interface AuthFormCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFormCard({
  title,
  description,
  badge = "WidgetLy",
  children,
  footer,
  className,
  ...props
}: AuthFormCardProps) {
  return (
    <div className={cn(authCardClassName, "p-8", className)} {...props}>
      <div className="mb-6">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ad8cff]">
          {badge}
        </p>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-white/50">{description}</p>
        )}
      </div>
      {children}
      {footer}
    </div>
  );
}

interface AuthFormSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function AuthFormSection({
  children,
  className,
  ...props
}: AuthFormSectionProps) {
  return (
    <div className={cn(authCardClassName, "p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function AuthFormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm text-white/70">
        {label}
      </label>
      {children}
    </div>
  );
}

export function AuthFormFooter({ children }: { children: ReactNode }) {
  return (
    <p className="mt-6 text-center text-sm text-white/50">{children}</p>
  );
}
