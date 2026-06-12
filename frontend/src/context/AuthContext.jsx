import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import httpStatus from "http-status";

// Create Context (no types in plain JS)
export const AuthContext = createContext({});

// Shared Axios instance with base URL
const client = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/v1/users`,
});

// Standalone API client for use outside AuthProvider (MeetingHistoryPage, VideoCallPage, etc.)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider Component
export const AuthProvider = ({ children }) => {

  // State
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionToast, setSessionToast] = useState('');
  const logoutRef = useRef(null);

  // Load saved user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("userData");
    if (savedUser && savedUser !== "undefined") {
      setUserData(JSON.parse(savedUser));
    } else {
      localStorage.removeItem("userData");
    }
  }, []);

  // Setup Axios 401 interceptor for token expiry
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setSessionToast("Session expired. Please login again.");
          setTimeout(() => {
            setSessionToast('');
            if (logoutRef.current) logoutRef.current();
            window.location.href = "/login";
          }, 2000);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, []);

  // Signup Handler
  const signup = async (fullName, email, password) => {
    setLoading(true);
    try {
      let request = await client.post("/signup", {
        name: fullName,
        email: email,
        password: password,
      });
      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (error) {
      throw new Error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Login Handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      let request = await client.post("/login", {
        email: email,
        password: password,
      });
      if (request.status === httpStatus.OK) {
        setUserData(request.data.user);
        localStorage.setItem("userData", JSON.stringify(request.data.user));
        localStorage.setItem("token", request.data.token);
      }
    } catch (error) {
      throw new Error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  // Login as Guest Handler (fully client-side, no backend call)
  const loginAsGuest = (guestName) => {
    const guestId = `guest-${Date.now()}`;
    const guestUser = { name: guestName, id: guestId };
    setUserData(guestUser);
    localStorage.setItem("userData", JSON.stringify(guestUser));
    // No token stored for guests — socket auth uses guestName + guestId directly
  };

  // Guest check helper
  const isGuest = userData?.id?.startsWith("guest-") || false;

  // Logout Handler
  const logout = () => {
    setUserData(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  };

  // Keep logoutRef in sync
  logoutRef.current = logout;

  // Context Data
  const data = { userData, setUserData, login, signup, loginAsGuest, logout, loading, isGuest, sessionToast };

  return (
    <>
      <AuthContext.Provider value={data}>{children}</AuthContext.Provider>
      {/* Session expired toast */}
      {sessionToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl z-[200] flex items-center space-x-2 animate-bounce-in">
          <span className="font-medium">{sessionToast}</span>
        </div>
      )}
    </>
  );
};
