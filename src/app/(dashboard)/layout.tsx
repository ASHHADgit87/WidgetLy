import { auth } from "@/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth();

  return (
    <div className="relative min-h-screen">
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-10 pt-32">
        {children}
      </main>
    </div>
  );
}
