import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Doc } from "../../convex/_generated/dataModel";

export function RoleGuard({
  user,
  allowedRole,
  children,
}: {
  user: Doc<"users">;
  allowedRole: "team" | "admin";
  children: ReactNode;
}) {
  const effectiveRole = user.role ?? "team";
  if (effectiveRole !== allowedRole) {
    const redirect = effectiveRole === "admin" ? "/admin" : "/dashboard";
    return <Navigate to={redirect} replace />;
  }
  return <>{children}</>;
}
