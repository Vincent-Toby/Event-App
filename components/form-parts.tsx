import { cn } from "@/lib/utils";

export const fieldClass =
  "h-14 rounded-lg border-input bg-background px-4 text-base shadow-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-foreground";

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function OutlinedField({
  label,
  htmlFor,
  required,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="relative">
        <label
          htmlFor={htmlFor}
          className="absolute -top-2.5 left-3 z-10 bg-background px-1.5 text-sm text-muted-foreground"
        >
          {label}
          {required && <span className="text-primary"> *</span>}
        </label>
        {children}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
