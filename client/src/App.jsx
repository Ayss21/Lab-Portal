import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar/navbar";
import About from "./Components/About/about";
import Homepage from "./pages/homepage";
import Labs from "./pages/labpage";
import LabDetailsPage from "./pages/labdetailspage";
import SignIn from "./Components/Auth/signin.jsx";
import SignUp from "./Components/Auth/signup.jsx";
import ProtectedRoute from "./Components/Auth/ProtectedRoute.jsx";
import AuthProvider from "./context/authcontext.jsx";
import { useAuth } from "./context/authcontext.jsx";
import { Loader2 } from "lucide-react";

// AppContent component to use AuthContext
const AppContent = () => {
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleAboutClick = () => {
    setIsAboutOpen(true);
  };

  const handleCloseAbout = () => {
    setIsAboutOpen(false);
  };

  // Display a loading spinner while authentication status is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 font-inter">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* Only show Navbar if user is logged in */}
      {user && <Navbar onAboutClick={handleAboutClick} />}

      <Routes>
        {/* Public Routes - Accessible when NOT logged in, redirects if logged in */}
        <Route
          path="/signin"
          element={user ? <Navigate to="/" replace /> : <SignIn />} // Redirect to root (which is now protected homepage)
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignUp />} // Redirect to root
        />

       
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage onAboutClick={handleAboutClick} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labs"
          element={
            <ProtectedRoute>
              <Labs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/labs/:id"
          element={
            <ProtectedRoute>
              {/* LabDetailsPage will receive route parameters (e.g., id) */}
              <LabDetailsPage />
            </ProtectedRoute>
          }
        />


        {/* Catch all route - Redirects to the root path, which handles auth check */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* About modal - only show if user is logged in */}
      {user && isAboutOpen && (
        <About
          isOpen={isAboutOpen}
          onClose={handleCloseAbout}
        />
      )}
    </div>
  );
};

// Main App component to wrap with AuthProvider and Router
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;