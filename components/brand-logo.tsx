import Link from "next/link";
import { cn } from "@/lib/utils";

const SIZES = {
  default: "h-9 md:h-11",
  large: "h-14 md:h-16",
} as const;

export function BrandLogo({
  size = "default",
  className,
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Uplink home"
      className={cn("inline-flex shrink-0 items-center", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/uplink-wordmark.svg"
        alt="Uplink"
        width={652}
        height={170}
        className={cn("w-auto", SIZES[size])}
      />
    </Link>
  );
}
