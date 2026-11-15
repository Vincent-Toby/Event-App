import { BrandLogo } from "@/components/brand-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10">
      <BrandLogo size="large" />
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
