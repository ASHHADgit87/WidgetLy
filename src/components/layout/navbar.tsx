"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface NavbarProps {}

const authedLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/widgets", label: "Widgets" },
  { href: "/docs", label: "Docs" },
  { href: "/profile", label: "Profile" },
];

export function Navbar({}: NavbarProps) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/user-exists");
        const json = await res.json();
        if (mounted && json?.success) {
          setUserExists(Boolean(json.data?.user_exists));
        }
      } catch {
        if (mounted) setUserExists(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.expires) return;
    const exp = new Date(session.expires).getTime();
    const ms = exp - Date.now();
    if (ms <= 0) {
      try {
        localStorage.removeItem("app_token");
        localStorage.removeItem("app_token_expires");
      } catch {}
      signOut({ callbackUrl: "/" });
      return;
    }

    const t = setTimeout(() => {
      try {
        localStorage.removeItem("app_token");
        localStorage.removeItem("app_token_expires");
      } catch {}
      signOut({ callbackUrl: "/" });
    }, ms);

    return () => clearTimeout(t);
  }, [session?.expires]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "AI";
    const parts = name.split(" ");
    return parts
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (status === "loading") return null;

  const ctaLabel = userExists === false ? "Get Started" : "Sign In";
  const ctaHref = userExists === false ? "/register" : "/login";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between w-full transition-all duration-500 px-6 md:px-16 lg:px-24 xl:px-32 ${
          scrolled
            ? "py-3 mt-3 mx-auto max-w-[92%] rounded-2xl bg-[#12021f]/95 backdrop-blur-md border border-[#5f2eb2]/40 shadow-2xl"
            : "py-6 mt-0 max-w-full bg-transparent"
        }`}
      >
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Widget Platform"
            width={210}
            height={45}
            priority
            className="h-10 w-auto transition-transform duration-300 hover:scale-105 md:h-12"
          />
        </Link>

        <div className="hidden md:flex items-center gap-12 text-base font-bold text-white">
          {isAuthenticated &&
            authedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/70 hover:text-white transition-all"
              >
                {link.label}
              </Link>
            ))}
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <button
              onClick={() => {
                window.location.href = ctaHref;
              }}
              className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#8d5cff] via-[#b184ff] to-[#dbaefd] border-2 border-white/20 hover:scale-105 transition-all shadow-lg text-sm whitespace-nowrap"
            >
              {ctaLabel}
            </button>
          ) : (
            <div className="relative">
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#8c5cff] to-[#d9a5ff] flex items-center justify-center text-[10px] font-black text-white border border-white/20">
                  {getInitials(session.user?.name)}
                </div>
                <span className="hidden md:block text-white font-bold text-xs">
                  {session.user?.name ?? "User"}
                </span>
              </div>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-44 py-2 bg-[#12021f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-[110]">
                  <Link
                    href="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Profile
                  </Link>
                  <div className="h-px bg-white/10 mx-2 my-1" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#8d5cff] via-[#b184ff] to-[#dbaefd] rounded-xl hover:scale-105 transition-all"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="md:hidden text-white"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[110] bg-[#12021f]/95 backdrop-blur-xl flex flex-col p-10 md:hidden">
          <div className="flex justify-between items-center mb-10">
            <Image
              src="/logo.png"
              alt="Widget Platform"
              width={160}
              height={34}
              className="h-10 w-auto"
              style={{ width: "auto" }}
            />
            <button
              onClick={() => setMenuOpen(false)}
              className="text-white text-3xl"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-6 text-xl text-white font-bold">
            {isAuthenticated && (
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            )}
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                } else {
                  setMenuOpen(false);
                  window.location.href = ctaHref;
                }
              }}
              className="py-2 rounded-xl font-bold text-white bg-gradient-to-r from-[#8d5cff] via-[#b184ff] to-[#dbaefd] hover:scale-105 transition-all whitespace-nowrap"
            >
              {isAuthenticated ? "Logout" : ctaLabel}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
