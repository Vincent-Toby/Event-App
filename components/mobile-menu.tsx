"use client";

import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  LogIn,
  LogOut,
  Menu,
  Plus,
  Search,
  Ticket,
  UserPlus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MobileMenuProps = {
  user: { name: string; email: string; image: string | null } | null;
  upcomingCount?: number;
};

export function MobileMenu({ user, upcomingCount = 0 }: MobileMenuProps) {
  const router = useRouter();
  const showBadge = user !== null && upcomingCount > 0;
  const badgeText = upcomingCount > 9 ? "9+" : String(upcomingCount);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              showBadge
                ? `Open menu, ${upcomingCount} upcoming ${upcomingCount === 1 ? "booking" : "bookings"}`
                : "Open menu"
            }
          />
        }
      >
        <Menu className="size-5" />
        {showBadge && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
            {badgeText}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block truncate font-medium">{user.name}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => router.push("/")}>
          <Search />
          Find events
        </DropdownMenuItem>
        {user && (
          <>
            <DropdownMenuItem onClick={() => router.push("/bookings")}>
              <Ticket />
              My bookings
              {upcomingCount > 0 && (
                <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {badgeText}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/my-events")}>
              <CalendarCheck />
              My events
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onClick={() => router.push("/events/new")}>
          <Plus />
          Create event
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem onClick={() => router.push("/sign-in")}>
              <LogIn />
              Sign in
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/sign-up")}>
              <UserPlus />
              Sign up
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
