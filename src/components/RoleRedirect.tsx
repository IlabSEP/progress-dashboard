import { Navigate } from "react-router-dom";
import { Doc } from "../../convex/_generated/dataModel";

export function RoleRedirect({ user }: { user: Doc<"users"> }) {
  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  // Default: team or unset role
  return <Navigate to="/dashboard" replace />;
}
