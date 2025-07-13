// src/context/authcontext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import ApiService from "../services/api.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the logged-in user/admin object along with their type
  const [loading, setLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    console.log("AuthContext: checkAuthStatus initiated.");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) {
        console.log(
          "AuthContext: Token found in localStorage. Verifying token with backend..."
        );
        const responseData = await ApiService.verifyToken();

        // Ensure user object always has a 'type' property for consistent role checking
        if (responseData.user) {
          setUser({ ...responseData.user, type: "user" });
          console.log(
            "AuthContext: User logged in. User data:",
            responseData.user
          );
        } else if (responseData.admin) {
          setUser({ ...responseData.admin, type: "admin" });
          console.log(
            "AuthContext: Admin logged in. Admin data:",
            responseData.admin
          );
        } else {
          console.log(
            "AuthContext: Token present but backend returned no user/admin data. Clearing token."
          );
          localStorage.removeItem("token");
          setUser(null);
        }
      } else {
        console.log("AuthContext: No token found in localStorage.");
        setUser(null);
      }
    } catch (error) {
      console.error("AuthContext: Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (credentials) => {
    setLoading(true);
    console.log(
      "AuthContext: Attempting login with credentials:",
      credentials.email || "Google Token",
      "Admin Key Present:",
      !!credentials.adminKey
    );
    try {
      let data;
      if (credentials.googleToken) {
        data = await ApiService.googleAuth(credentials.googleToken);
      } else if (credentials.adminKey) {
        data = await ApiService.adminSignIn({
          email: credentials.email,
          password: credentials.password,
          adminKey: credentials.adminKey,
        });
      } else {
        data = await ApiService.signIn({
          email: credentials.email,
          password: credentials.password,
        });
      }

      localStorage.setItem("token", data.token);
      if (data.user) {
        setUser({ ...data.user, type: "user" }); // Ensure type is set
        console.log(
          "AuthContext: User login successful. User data set:",
          data.user
        );
      } else if (data.admin) {
        setUser({ ...data.admin, type: "admin" }); // Ensure type is set
        console.log(
          "AuthContext: Admin login successful. Admin data set:",
          data.admin
        );
      } else {
        throw new Error("Login failed: No user or admin data received.");
      }
      return {
        success: true,
        user: data.user || data.admin, // Return the actual user/admin data
        token: data.token,
      };
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      return { success: false, error: error.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    console.log(
      "AuthContext: Attempting user registration for email:",
      userData.email
    );
    try {
      const data = await ApiService.signUp(userData);
      // For registration, we assume the registered user is of type 'user' unless otherwise specified
      setUser({ ...data.user, type: "user" }); // Assuming signUp returns { user: {...}, token: "..." }
      localStorage.setItem("token", data.token);
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      console.error("AuthContext: User Registration error:", error);
      return { success: false, error: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const adminRegister = async (adminData) => {
    setLoading(true);
    console.log(
      "AuthContext: Attempting admin registration for email:",
      adminData.email
    );
    try {
      const data = await ApiService.adminSignUp(adminData);
      // For admin registration, set type to 'admin'
      setUser({ ...data.admin, type: "admin" }); // Assuming adminSignUp returns { admin: {...}, token: "..." }
      localStorage.setItem("token", data.token);
      return { success: true, admin: data.admin, token: data.token };
    } catch (error) {
      console.error("AuthContext: Admin Registration error:", error);
      return {
        success: false,
        error: error.message || "Admin registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log("AuthContext: Logging out...");
    ApiService.logout().catch((err) =>
      console.error("AuthContext: Error calling backend logout:", err)
    );
    localStorage.removeItem("token");
    setUser(null);
    console.log("AuthContext: Logout completed. User set to null.");
  };

  // This is the core function for checking admin status
  const isAdmin = () => {
    return user && user.type === "admin";
  };

  const value = {
    user,
    loading,
    login,
    register,
    adminRegister,
    logout,
    isAdmin, // Export isAdmin for use in other components
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;