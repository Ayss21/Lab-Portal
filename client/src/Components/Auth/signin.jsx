// src/Components/Auth/signin.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/authcontext.jsx";
import { Loader2 } from "lucide-react";
import Toast from "../common/toast.jsx";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    adminKey: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeTab, setActiveTab] = useState("user"); // 'user' or 'admin'
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to set activeTab based on URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tabFromUrl = queryParams.get("tab");
    if (tabFromUrl === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("user");
    }
  }, [location.search]);

  // Load Google Sign-In script and render button
  useEffect(() => {
    const loadGoogleScript = () => {
      if (!document.getElementById("google-jssdk")) {
        const script = document.createElement("script");
        script.id = "google-jssdk";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("Google GSI script loaded.");
          initializeGoogleSignIn();
        };
        script.onerror = () => {
          console.error("Failed to load Google GSI script.");
          setError(
            "Failed to load Google Sign-In. Please check your internet connection."
          );
        };
        document.body.appendChild(script);
      } else {
        console.log("Google GSI script already present.");
        initializeGoogleSignIn();
      }
    };

    const initializeGoogleSignIn = () => {
      if (window.google && import.meta.env.VITE_APP_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        const signInDiv = document.getElementById("signInDiv");
        if (signInDiv) {
          signInDiv.innerHTML = ""; // Clear existing button before rendering
          window.google.accounts.id.renderButton(signInDiv, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            width: signInDiv.offsetWidth || 300,
          });
          console.log("Google Sign-In button rendered.");
        } else {
          console.warn(
            "signInDiv not found for Google button rendering. Ensure the div with id='signInDiv' exists in your JSX."
          );
        }
      } else {
        console.warn("Google Client ID not found or Google script not ready.");
        setError(
          "Google Sign-In is not configured correctly or failed to load."
        );
      }
    };

    if (activeTab === "user") {
      loadGoogleScript();
    } else {
      // If switching to admin tab, remove the Google script and button
      const script = document.getElementById("google-jssdk");
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      const signInDiv = document.getElementById("signInDiv");
      if (signInDiv) {
        signInDiv.innerHTML = "";
      }
    }

    return () => {
      const script = document.getElementById("google-jssdk");
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [activeTab]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
    setToastMessage(null);
    setFormData((prev) => ({
      ...prev,
      adminKey: "",
      password: "",
    }));
    // Update URL without navigating, just changing query param
    navigate(`/signin?tab=${tab}`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setToastMessage(null);
    setLoading(true);

    // Client-side validation for admin key (This was the key addition)
    if (activeTab === "admin" && !formData.adminKey.trim()) {
      setError("Admin Key is required for admin sign-in.");
      setToastMessage({ type: "error", message: "Admin Key is required." });
      setLoading(false);
      return;
    }

    let credentialsToSend;
    let loginTypeMessage;

    if (activeTab === "admin") {
      credentialsToSend = {
        email: formData.email,
        password: formData.password,
        adminKey: formData.adminKey,
      };
      loginTypeMessage = "Admin";
    } else {
      // activeTab === 'user'
      credentialsToSend = {
        email: formData.email,
        password: formData.password,
      };
      loginTypeMessage = "User";
    }

    console.log(
      `Attempting ${loginTypeMessage} sign-in with:`,
      credentialsToSend.email
    );

    try {
      const result = await login(credentialsToSend);

      if (result.success) {
        console.log(`${loginTypeMessage} Sign-in successful:`, result.user);
        const loginMessage =
          result.user.type === "admin"
            ? "Logged in as Admin!"
            : "Sign-in successful!";
        setToastMessage({
          type: "success",
          message: `${loginMessage} Redirecting...`,
        });

        setLoading(false);
        setTimeout(() => {
          navigate("/"); // Navigate to homepage
        }, 1500);
      } else {
        console.error(`${loginTypeMessage} Sign-in failed:`, result.error);
        setError(result.error);
        setToastMessage({ type: "error", message: result.error });
        setLoading(false);
      }
    } catch (err) {
      console.error(
        `${loginTypeMessage} Sign-in network/unexpected error:`,
        err
      );
      setError(err.message || "An unexpected error occurred during sign-in.");
      setToastMessage({
        type: "error",
        message: err.message || "An unexpected error occurred.",
      });
      setLoading(false);
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    if (activeTab !== "user") {
      console.warn(
        "Google credential response received while not on user tab. Ignoring."
      );
      return;
    }

    setLoading(true);
    setError("");
    setToastMessage(null);
    console.log("Google credential response received.");

    try {
      const result = await login({ googleToken: response.credential });

      if (result.success) {
        console.log("Google Sign-in successful:", result.user);
        setToastMessage({
          type: "success",
          message: "Google Sign-in successful! Redirecting...",
        });
        setLoading(false);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        console.error("Google Sign-in failed:", result.error);
        setError(result.error);
        setToastMessage({ type: "error", message: result.error });
        setLoading(false);
      }
    } catch (err) {
      console.error("Google Sign-In failed:", err);
      setError(err.message || "Google Sign-In failed. Please try again.");
      setToastMessage({
        type: "error",
        message: err.message || "Google Sign-In failed.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Lab Portal
          </h2>
          {activeTab === "admin" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Staff members, please sign in with your admin credentials. If you
              don't have an account,{" "}
              <Link
                to="/signup?type=admin"
                className="font-medium text-blue-600 hover:text-blue-500">
                create an admin account first
              </Link>
              .
            </p>
          )}
          {activeTab === "user" && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <Link
                to="/signup?type=user"
                className="font-medium text-blue-600 hover:text-blue-500">
                create a new user account
              </Link>
            </p>
          )}
        </div>

        {/* User/Admin Toggle Buttons */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={() => handleTabChange("user")}
            className={`px-6 py-2 rounded-l-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "user"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}>
            Sign in as User
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("admin")}
            className={`px-6 py-2 rounded-r-md text-sm font-medium transition-colors duration-200 ${
              activeTab === "admin"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}>
            Sign in as Admin
          </button>
        </div>

        <form
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label
                htmlFor="email"
                className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${
                  activeTab === "admin" ? "rounded-none" : "rounded-b-md"
                }`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {activeTab === "admin" && (
              <div>
                <label
                  htmlFor="adminKey"
                  className="sr-only">
                  Admin Key
                </label>
                <input
                  id="adminKey"
                  name="adminKey"
                  type="password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Key"
                  value={formData.adminKey}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : null}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {activeTab === "user" && ( // Only show Google sign-in for user tab
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <div
                id="signInDiv"
                className="w-full"></div>
            </div>
          </div>
        )}
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default SignIn;
