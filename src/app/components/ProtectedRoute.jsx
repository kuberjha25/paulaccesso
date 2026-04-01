import { Navigate } from "react-router";
import { useApp } from "./context/AppContext";

export function ProtectedRoute({ children }) {
  const { user, token, isAuthInitialized } = useApp();

  // Wait for auth initialization
  if (!isAuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && !token) {
    return <Navigate to="/" replace />;
  }

  return children;
}