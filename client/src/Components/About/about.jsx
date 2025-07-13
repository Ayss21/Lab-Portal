import React from "react";
import logo from "../../assets/logo.png"; // Ensure this path is correct
import { X, Zap, Users, Clock, Shield } from "lucide-react";

const About = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 bg-opacity-70 z-50 flex items-center justify-center p-4 font-inter">
      {" "}
      {/* Changed bg-greyclr to bg-gray-900 and added font-inter */}
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100">
        {" "}
        {/* Added transition for modal effect */}
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Lab Portal Logo"
                className="w-10 h-10 mt-1 object-contain"
              />
              <h2 className="text-xl font-bold text-gray-900">
                About <span className="text-blue-600">Lab Portal</span>
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* About Content */}
          <div className="text-center mb-6">
            <p className="text-gray-600 leading-relaxed text-base">
              {" "}
              {/* Changed text-[16px] to text-base */}
              Lab Portal transforms how educational institutions manage
              laboratory operations. Our platform creates seamless connections
              between students, teachers, and administrators through an
              intuitive, modern interface built for any college or university.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-blue-50 p-4 rounded-xl mb-6">
            <p className="text-blue-800 font-semibold text-center text-lg">
              "Making lab management effortless for everyone"
            </p>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {" "}
            {/* Responsive grid */}
            <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
              {" "}
              {/* Added shadow */}
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Real-Time Scheduling
              </h4>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg shadow-sm">
              {" "}
              {/* Added shadow */}
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Multi-User Access
              </h4>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg shadow-sm">
              {" "}
              {/* Added shadow */}
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">
                Secure & Scalable
              </h4>{" "}
              {/* Changed "Universal Design" to "Secure & Scalable" - more fitting for a portal */}
            </div>
          </div>

          {/* Get Started Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-blue-100 text-blue-800 px-8 py-3 rounded-lg hover:bg-blue-600 hover:text-white transition-colors font-semibold shadow-md hover:shadow-lg">
              Close
            </button>{" "}
            {/* Changed text to "Close" */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
