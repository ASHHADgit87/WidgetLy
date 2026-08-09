import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth();

  return (
    <div className="relative min-h-screen">
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6 sm:pb-10 sm:pt-32">
        {children}
      </main>
    </div>
  );
}
