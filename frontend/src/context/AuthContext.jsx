import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import httpStatus from "http-status";

// Create Context (no types in plain JS)
export const AuthContext = createContext({});

const client = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/v1/users`,
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

  // Load saved user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("userData");
    if (savedUser && savedUser !== "undefined") {
      setUserData(JSON.parse(savedUser));
    } else {
      localStorage.removeItem("userData");
    }
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
      console.log(request);
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

  // Login as Guest Handler
  const loginAsGuest = async (guestName) => {
    setLoading(true);
    try {
      const guestUser = {
        name: guestName,
        id: `guest-${Date.now()}`,
      };
      setUserData(guestUser);
    localStorage.setItem("userData", JSON.stringify(guestUser));
    } catch (error) {
      throw new Error("Error logging in as Guest");
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const logout = () => {
    setUserData(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
  };

  // Context Data
  const data = { userData, setUserData, login, signup, loginAsGuest, logout, loading };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
