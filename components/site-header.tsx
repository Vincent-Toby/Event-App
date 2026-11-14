import Form from "next/form";
import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { getSession } from "@/lib/session";
import { MobileMenu } from "@/components/mobile-menu";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchForm({ className }: { className?: string }) {
  return (
    <Form action="/" role="search" className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          type="search"
          placeholder="Search events"
          aria-label="Search events"
          className="h-10 rounded-full pl-9"
        />
      </div>
    </Form>
  );
}

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user ?? null;
  const menuUser = user
    ? { name: user.name, email: user.email, image: user.image ?? null }
    : null;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 md:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarDays className="size-4" />
          </span>
          <span>Event App</span>
        </Link>

        <SearchForm className="hidden max-w-md flex-1 md:block" />

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

      <div className="border-t px-4 py-2 md:hidden">
        <SearchForm />
      </div>
    </header>
  );
}
