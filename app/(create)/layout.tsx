export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-svh bg-background">{children}</div>;
}
