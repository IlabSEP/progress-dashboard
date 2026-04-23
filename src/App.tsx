import { Layout } from "@/Layout";
import { RoleRedirect } from "@/components/RoleRedirect";
import { RoleGuard } from "@/components/RoleGuard";
import { LoginPage } from "@/pages/LoginPage";
import { TeamDashboard } from "@/pages/team/TeamDashboard";
import { SubmitUpdate } from "@/pages/team/SubmitUpdate";
import { TeamProfile } from "@/pages/team/TeamProfile";
import { ViewUpdate } from "@/pages/team/ViewUpdate";
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { AdminTagManagement } from "@/pages/admin/AdminTagManagement";
import { RequestUpdate } from "@/pages/admin/RequestUpdate";
import { AdminTeamDetail } from "@/pages/admin/AdminTeamDetail";
import { AdminViewUpdate } from "@/pages/admin/AdminViewUpdate";
import { AdminViewRequest } from "@/pages/admin/AdminViewRequest";
import { AdminViewCommit } from "@/pages/admin/AdminViewCommit";
import { TeamNameDialog } from "@/components/TeamNameDialog";
import { Toaster } from "@/components/ui/toaster";
import { api } from "../convex/_generated/api";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <>
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </Unauthenticated>
      <Toaster />
    </>
  );
}

function AuthenticatedApp() {
  const user = useQuery(api.users.viewer);
  if (!user) return null;

  return (
    <Layout user={user}>
      {user.role !== "admin" && !user.teamName && <TeamNameDialog />}
      <Routes>
        <Route path="/" element={<RoleRedirect user={user} />} />
        <Route
          path="/dashboard"
          element={
            <RoleGuard user={user} allowedRole="team">
              <TeamDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/dashboard/submit"
          element={
            <RoleGuard user={user} allowedRole="team">
              <SubmitUpdate />
            </RoleGuard>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <RoleGuard user={user} allowedRole="team">
              <TeamProfile />
            </RoleGuard>
          }
        />
        <Route
          path="/dashboard/update/:updateId"
          element={
            <RoleGuard user={user} allowedRole="team">
              <ViewUpdate />
            </RoleGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <RoleGuard user={user} allowedRole="admin">
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/tags"
          element={
            <RoleGuard user={user} allowedRole="admin">
              <AdminTagManagement />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/commit/:commitId"
          element={
            <RoleGuard user={user} allowedRole="admin">
              <AdminViewCommit />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/request-update"
          element={
            <RoleGuard user={user} allowedRole="admin">
              <RequestUpdate />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/update/:updateId"
          element={
            <RoleGuard user={user} allowedRole="admin">
              <AdminViewUpdate />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/request/:requestedAt"
          element={
            <RoleGuard user={user} allowedRole="admin">
              <AdminViewRequest />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/team/:teamId"
          element={
            <RoleGuard user={user} allowedRole="admin">
              <AdminTeamDetail />
            </RoleGuard>
          }
        />
      </Routes>
    </Layout>
  );
}
