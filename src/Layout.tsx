import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserMenu } from "@/components/UserMenu";
import { Doc } from "../convex/_generated/dataModel";

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`relative uppercase tracking-[0.14em] text-[11px] font-mono transition-colors hover:text-ink ${
        isActive ? "text-ink" : "text-ink/55"
      }`}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-2 left-0 right-0 h-[2px] bg-vermilion" />
      )}
    </Link>
  );
}

export function Layout({
  user,
  children,
}: {
  user?: Doc<"users"> | null;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-cream-paper text-ink-deep">
      <header className="sticky top-0 z-10 border-b border-ink/15 bg-cream-paper/90 backdrop-blur">
        <nav className="container flex w-full items-center justify-between gap-6 py-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex items-center gap-3">
              <img
                src={`${import.meta.env.BASE_URL}ccds_innovation_lab_logo.jpeg`}
                alt="Innovation Lab @ NTU CCDS"
                className="h-9 w-9 rounded-sm object-cover ring-1 ring-ink/20"
              />
              <div className="leading-tight">
                <p className="font-display text-[17px] italic text-ink-deep">
                  iLab SEP
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-ink/55">
                  Progress tracker
                </p>
              </div>
            </Link>
            {user && (
              <div className="hidden items-center gap-6 md:flex">
                {user.role !== "admin" && (
                  <>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/dashboard/submit">File Update</NavLink>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <NavLink to="/admin">Dashboard</NavLink>
                    <NavLink to="/admin/tags">Tags</NavLink>
                    <NavLink to="/admin/request-update">Request Update</NavLink>
                  </>
                )}
              </div>
            )}
          </div>
          {user && (
            <UserMenu>
              {user.teamName ?? user.name ?? user.email ?? "User"}
            </UserMenu>
          )}
        </nav>
      </header>
      <main className="flex grow flex-col overflow-auto">{children}</main>
    </div>
  );
}
