import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Link } from "react-router-dom";

export function UserMenu({ children }: { children: ReactNode }) {
  const user = useQuery(api.users.viewer);
  const profileImageUrl = useQuery(
    api.files.getImageUrl,
    user?.profileImage
      ? { storageId: user.profileImage }
      : { storageId: undefined }
  );
  const initial = (user?.teamName ?? user?.name ?? user?.email ?? "T")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-deep">
      <span className="hidden sm:inline">{children}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open user menu"
            className="group relative h-10 w-10 overflow-hidden rounded-full border border-ink/25 bg-cream transition-colors hover:border-vermilion focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermilion focus-visible:ring-offset-2 focus-visible:ring-offset-cream-paper"
          >
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-lg italic text-ink-deep">
                {initial}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[220px] rounded-sm border border-ink/20 bg-cream-paper font-sans shadow-[0_8px_24px_-12px_rgba(7,40,73,0.25)]"
        >
          <DropdownMenuLabel className="px-3 pt-3 pb-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-ink/55">
              Signed in as
            </p>
            <p className="font-display mt-0.5 text-lg italic leading-tight text-ink-deep">
              {children}
            </p>
            {user?.email && (
              <p className="font-mono mt-0.5 truncate text-[10px] tracking-normal text-ink/50">
                {user.email}
              </p>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-ink/15" />
          {user?.role !== "admin" && (
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/profile"
                className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.2em] text-ink-deep focus:bg-cream focus:text-vermilion"
              >
                Profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-ink/15" />
          <SignOutButton />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
    <DropdownMenuItem
      onClick={() => void signOut()}
      className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.2em] text-ink-deep focus:bg-cream focus:text-vermilion"
    >
      Sign out
    </DropdownMenuItem>
  );
}
