"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth/auth-page-shell";
import {
  AuthFormCard,
  AuthFormField,
  AuthFormFooter,
} from "@/components/auth/auth-form-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    try {
      const tokenRes = await fetch("/api/auth/token");
      const tokenJson = await tokenRes.json();
      if (tokenJson?.success && tokenJson.data?.token) {
        localStorage.setItem("app_token", tokenJson.data.token);
        localStorage.setItem(
          "app_token_expires",
          String(tokenJson.data.expiresAt),
        );
      }
    } catch {}

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <AuthFormCard
      title="Sign in"
      description="Access your widget dashboard."
      footer={
        <AuthFormFooter>
          No account?{" "}
          <Link
            href="/register"
            className="text-[#c9b3ff] transition hover:text-white"
          >
            Register
          </Link>
        </AuthFormFooter>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </AuthFormField>

        <AuthFormField label="Password" htmlFor="password">
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AuthFormField>

        {error && <p className="text-sm text-purple">{error}</p>}

        <Button
          type="submit"
          variant="secondary"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthFormCard>
  );
}

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<div className="p-8 text-center text-white/50">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </AuthPageShell>
  );
}
