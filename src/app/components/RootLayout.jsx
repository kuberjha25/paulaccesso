import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  UserPlus,
  ClipboardList,
  Home,
  Settings,
  Moon,
  Sun,
  LogOut,
  Users,
  Menu,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { useApp } from "./context/AppContext";
import { useState, useEffect } from "react";
import { SettingsDrawer } from "./layout/SettingsDrawer";
import { UserManagement } from "./admin/UserManagement";

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    darkMode,
    toggleDarkMode,
    user,
    logout,
    sendOtp,
    verifyOtp,
    loading,
  } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(!user);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setShowLogin(!user);
    if (user) {
      if (location.pathname === "/login") {
        navigate("/");
      }
    }
  }, [user, navigate, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSendOtp = async () => {
    if (await sendOtp(email)) {
      setOtpSent(true);
    }
  };

  const handleVerifyOtp = async () => {
    if (await verifyOtp(email, otp)) {
      setShowLogin(false);
      setOtpSent(false);
      setEmail("");
      setOtp("");
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/");
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <div className="w-18 h-18 rounded-xl overflow-hidden">
                <img
                  src="/pml_logo.png"
                  alt="Paul Accesso"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Paul Accesso
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Login with your email
            </p>
          </div>

          {!otpSent ? (
            <>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Button
                onClick={handleSendOtp}
                disabled={loading || !email}
                className="w-full"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                OTP sent to {email}
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Button
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <button
                onClick={() => setOtpSent(false)}
                className="w-full text-sm text-blue-600 dark:text-blue-400 mt-3"
              >
                Back to email
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/register", icon: UserPlus, label: "Register Visitor" },
    { path: "/log", icon: ClipboardList, label: "Visitor Log" },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({ path: "/admin", icon: Users, label: "Admin Panel" });
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Title - Always visible */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden">
                  <img
                    src="/pml_logo.png"
                    alt="Paul Accesso"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Paul Accesso
                  </h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                    Welcome, {user?.name || user?.email}{" "}
                    {user?.designation && `(${user.designation})`}
                  </p>
                </div>
              </div>

              {/* Desktop Navigation - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Mobile Welcome Text */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 md:hidden">
              Welcome, {user?.name || user?.email}
              {user?.designation && ` (${user.designation})`}
            </p>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex flex-wrap gap-2 mt-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className={
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
              <div className="md:hidden fixed inset-x-0 top-[72px] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-40">
                <div className="px-4 py-3 space-y-2">
                  {/* Navigation Links */}
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link key={item.path} to={item.path}>
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          className={`w-full justify-start ${
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2 pt-2">
                    {/* Dark Mode Toggle */}
                    <Button
                      variant="ghost"
                      onClick={toggleDarkMode}
                      className="w-full justify-start text-gray-700 dark:text-gray-300"
                    >
                      {darkMode ? (
                        <Sun className="w-4 h-4 mr-2" />
                      ) : (
                        <Moon className="w-4 h-4 mr-2" />
                      )}
                      {darkMode ? "Light Mode" : "Dark Mode"}
                    </Button>

                    {/* Settings */}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSettingsOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-gray-700 dark:text-gray-300"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>

                    {/* Logout */}
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowLogoutConfirm(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {location.pathname === "/admin" && user?.role === "ADMIN" ? (
            <UserManagement />
          ) : (
            <Outlet />
          )}
        </main>

        <SettingsDrawer
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Logout Confirmation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to logout? You'll need to login again to
                  access your account.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowLogoutConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
