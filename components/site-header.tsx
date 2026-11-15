import Link from "next/link";
import { getSession } from "@/lib/session";
import { getUpcomingBookingCount } from "@/lib/booking-count";
import { BrandLogo } from "@/components/brand-logo";
import { MobileMenu } from "@/components/mobile-menu";
import { MyBookingsLink } from "@/components/my-bookings-link";
import { SearchBox } from "@/components/search-box";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user ?? null;
  const menuUser = user
    ? { name: user.name, email: user.email, image: user.image ?? null }
    : null;
  // Read the time after the session so the page can still be prepared in advance.
  const upcomingCount = user
    ? await getUpcomingBookingCount(user.id, new Date())
    : 0;

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:flex-nowrap md:px-6">
        <BrandLogo />

        <SearchBox className="order-last w-full md:order-none md:max-w-xl md:flex-1" />

        <nav className="ml-auto hidden items-center gap-2 md:flex">
          {menuUser ? (
            <MyBookingsLink count={upcomingCount} />
          ) : (
            <Button
              variant="ghost"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Find events
            </Button>
          )}
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
          <MobileMenu user={menuUser} upcomingCount={upcomingCount} />
        </div>
      </div>
    </header>
  );
}
