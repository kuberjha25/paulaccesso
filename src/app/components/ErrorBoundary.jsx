// components/ErrorBoundary.jsx
import { useRouteError, Link } from "react-router";

export function ErrorBoundary() {
    const error = useRouteError();

    // Check if it's a 404 error
    if (error?.status === 404) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The page you're looking for doesn't exist or you don't have access to it.
                    </p>
                    <Link to="/">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Go to Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    // Generic error fallback
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {error?.message || "An unexpected error occurred"}
                </p>
                <Link to="/">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Dashboard
                    </button>
                </Link>
            </div>
        </div>
    );
}