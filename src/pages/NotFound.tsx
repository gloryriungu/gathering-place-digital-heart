/**
 * 404 ERROR PAGE - PAGE NOT FOUND
 * 
 * LANGUAGE/FRAMEWORK: TypeScript + React (TSX)
 * - TypeScript: Provides type safety for React components
 * - React: Component-based library for building the UI
 * - React Router: For handling routing and location detection
 * 
 * FUNCTIONALITY:
 * This page is displayed when users navigate to a URL that doesn't exist in the application.
 * Key features:
 * - Displays friendly 404 error message to users
 * - Logs the attempted route to console for debugging purposes
 * - Provides a link back to the home page for easy navigation
 * - Improves user experience by preventing dead-ends in navigation
 * 
 * ERROR TRACKING:
 * - Uses useEffect to log the invalid route path to console
 * - Helps developers identify broken links or navigation issues
 * - Captures the attempted URL using React Router's useLocation hook
 */
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
