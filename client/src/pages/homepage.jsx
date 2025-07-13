// src/Components/Homepage/homepage.jsx
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Users, BookOpen, ArrowRight, MapPin } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/authcontext.jsx'; // Import useAuth
import Toast from '../Components/common/toast.jsx'; // Import Toast component

const Homepage = ({ onAboutClick }) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth(); // Get user and isAdmin status
  const [showAdminToast, setShowAdminToast] = useState(false);

  // Effect to show admin toast only once after login
  useEffect(() => {
    if (isAdmin() && !sessionStorage.getItem('adminToastShown')) {
      setShowAdminToast(true);
      sessionStorage.setItem('adminToastShown', 'true'); // Mark as shown in session storage
    }
  }, [isAdmin]);

  const handleLabClick = () => {
    // Changed navigation from /labs to /labdetails
    navigate("/labs");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-inter">
      {/* Admin Toast Message */}
      {showAdminToast && (
        <Toast
          message="Logged in as Admin!"
          type="success"
          duration={3000}
          onClose={() => setShowAdminToast(false)}
        />
      )}

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Your Gateway to
                  <span className="text-blue-600 block">Smart Lab Management</span>
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed">
                  Discover, book, and manage laboratory sessions effortlessly.
                  Connect students, teachers, and administrators in one unified platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onClick={handleLabClick} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl">
                  Explore Labs
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={onAboutClick}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Learn More
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-gray-600">Access</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">50+</div>
                  <div className="text-gray-600">Labs Available</div>
                </div>
              </div>
            </div>

            {/* Right Side - Image/Illustration (Adjusted for responsiveness) */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl w-full max-w-md lg:max-w-none">
                <div className="bg-white rounded-2xl p-8 space-y-6">
                  {/* Lab Schedule Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Computer Lab A</h3>
                        <p className="text-sm text-gray-600">Ground Floor</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>09:00 - 12:00</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>25/30 Students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Available Today</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Physics Lab</span>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Available</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium text-orange-800">Chemistry Lab</span>
                      <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">Busy</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Biology Lab</span>
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements (Adjusted positioning for better responsiveness) */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hidden sm:flex">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hidden sm:flex">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Lab Portal?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-blue-50 to-white border border-blue-100 shadow-md">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Scheduling</h3>
              <p className="text-gray-600">
                View real-time lab availability and schedule sessions with ease
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-green-50 to-white border border-green-100 shadow-md">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Multi-User Access</h3>
              <p className="text-gray-600">
                Seamless experience for students, teachers, and administrators
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-purple-50 to-white border border-purple-100 shadow-md">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Easy Management</h3>
              <p className="text-gray-600">
                Intuitive interface for managing lab resources and timetables
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Homepage;
