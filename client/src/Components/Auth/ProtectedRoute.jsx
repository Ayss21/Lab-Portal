// --- ProtectedRoute.jsx 
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authcontext';
import { Loader2, ShieldOff } from 'lucide-react'; // Added ShieldOff icon

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 font-inter">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading user session...</p>
        </div>
      </div>
    );
  }

  // If not loading and no user, redirect to sign-in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // If admin access is required but user is not an admin
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 font-inter px-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-md w-full">
          <ShieldOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have the necessary permissions to view this page.</p>
          <button
            onClick={() => window.history.back()} // Go back to previous page
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If authenticated and authorized, render children
  return children;
};

export default ProtectedRoute;
