// routes.js
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { VisitorRegistration } from "./components/VisitorRegistration";
import { VisitorLog } from "./components/VisitorLog";
import { Dashboard } from "./components/Dashboard";
import { UserManagement } from "./components/admin/UserManagement";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
        )
      },
      {
        path: "register",
        element: (
            <ProtectedRoute>
              <VisitorRegistration />
            </ProtectedRoute>
        )
      },
      {
        path: "log",
        element: (
            <ProtectedRoute>
              <VisitorLog />
            </ProtectedRoute>
        )
      },
      {
        path: "admin",
        element: (
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
        )
      },
    ],
  },
]);