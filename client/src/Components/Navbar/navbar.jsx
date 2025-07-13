import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authcontext"; // Import useAuth hook
import logo from "../../assets/logo.png"; // Ensure this path is correct
import { Menu, X } from 'lucide-react'; // For mobile menu icon

const Navbar = ({ onAboutClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get user and logout function from AuthContext
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // State for mobile menu

  const handleLabClick = () => {
    navigate("/labs");
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  const handleHomeClick = () => {
    navigate("/");
    setIsMobileMenuOpen(false); // Close menu on navigation
  };

  const handleLoginClick = () => {
    navigate("/signin"); // Assuming /signin is your login route
    setIsMobileMenuOpen(false);
  };

  const handleRegisterClick = () => {
    navigate("/signup"); // Assuming /signup is your registration route
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate("/"); // Redirect to home or login page after logout
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-40 font-inter"> {/* Fixed position, shadow, z-index */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"> {/* Responsive padding */}
        {/* Logo */}
        <div className="logodiv flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
          <img
            src={logo}
            alt="Lab Portal Logo"
            className="w-9 h-9 object-contain" // Slightly adjusted size
          />
          <h1 className="logo text-2xl font-bold text-blue-600">
            Lab<span className="text-gray-800">Portal</span> {/* Changed color for "Portal" */}
          </h1>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8"> {/* Hide on small screens */}
          <li
            onClick={handleHomeClick}
            className="menulist text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none">
            Home
          </li>
          <li
            className="menulist text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none"
            onClick={onAboutClick}>
            About
          </li>
          <li
            className="menulist text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none"
            onClick={handleLabClick}>
            Labs
          </li>
          {user ? (
            // If user is logged in, show Logout
            <li
              className="menulist text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer list-none"
              onClick={handleLogout}>
              Logout
            </li>
          ) : (
            // If no user, show Login and Register
            <>
              <li
                className="menulist text-gray-600 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none"
                onClick={handleLoginClick}>
                Login
              </li>
              <li
                className="menulist bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer list-none"
                onClick={handleRegisterClick}>
                Register
              </li>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg py-4 px-4 pb-6"> {/* Added pb-6 for spacing */}
          <div className="flex flex-col items-center space-y-4">
            <li
              onClick={handleHomeClick}
              className="menulist text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none w-full text-center py-2">
              Home
            </li>
            <li
              className="menulist text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none w-full text-center py-2"
              onClick={onAboutClick}>
              About
            </li>
            <li
              className="menulist text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none w-full text-center py-2"
              onClick={handleLabClick}>
              Labs
            </li>
            {user ? (
              <li
                className="menulist text-blue-600 border border-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200 cursor-pointer list-none w-full text-center"
                onClick={handleLogout}>
                Logout
              </li>
            ) : (
              <>
                <li
                  className="menulist text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200 list-none w-full text-center py-2"
                  onClick={handleLoginClick}>
                  Login
                </li>
                <li
                  className="menulist bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer list-none w-full text-center"
                  onClick={handleRegisterClick}>
                  Register
                </li>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
