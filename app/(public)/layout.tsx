import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<div className="h-16 border-b" />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6">
        {children}
      </main>
    </div>
  );
}
