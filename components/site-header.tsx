import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { getSession } from "@/lib/session";
import { MobileMenu } from "@/components/mobile-menu";
import { SearchBox } from "@/components/search-box";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user ?? null;
  const menuUser = user
    ? { name: user.name, email: user.email, image: user.image ?? null }
    : null;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays className="size-4" />
          </span>
          <span>Event App</span>
        </Link>

        <SearchBox className="order-last w-full md:order-none md:max-w-xl md:flex-1" />

        <nav className="ml-auto hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/" />}
          >
            Find events
          </Button>
          <Button nativeButton={false} render={<Link href="/events/new" />}>
            Create event
          </Button>
          {menuUser ? (
            <UserMenu user={menuUser} />
          ) : (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Sign in
            </Button>
          )}
        </nav>

        <div className="ml-auto md:hidden">
          <MobileMenu user={menuUser} />
        </div>
      </div>
    </header>
  );
}
