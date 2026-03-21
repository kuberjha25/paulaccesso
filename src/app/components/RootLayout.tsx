import { Outlet, Link, useLocation } from "react-router";
import { UserPlus, ClipboardList, Home } from "lucide-react";
import { Button } from "./ui/button";

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-violet-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                <Home className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent">
                  PaulAccesso
                </h1>
                <p className="text-sm text-slate-600">Visitor Management System</p>
              </div>
            </div>
            <nav className="flex gap-2">
              <Link to="/">
                <Button
                  variant={location.pathname === "/" ? "default" : "ghost"}
                  size="sm"
                  className={location.pathname === "/" ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white" : "text-slate-700 hover:bg-violet-50"}
                >
                  <Home className="size-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant={location.pathname === "/register" ? "default" : "ghost"}
                  size="sm"
                  className={location.pathname === "/register" ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white" : "text-slate-700 hover:bg-violet-50"}
                >
                  <UserPlus className="size-4 mr-2" />
                  Register Visitor
                </Button>
              </Link>
              <Link to="/log">
                <Button
                  variant={location.pathname === "/log" ? "default" : "ghost"}
                  size="sm"
                  className={location.pathname === "/log" ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 text-white" : "text-slate-700 hover:bg-violet-50"}
                >
                  <ClipboardList className="size-4 mr-2" />
                  Visitor Log
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-80px)]">
        <Outlet />
      </main>
    </div>
  );
}