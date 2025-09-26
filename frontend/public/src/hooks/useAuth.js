// src/hooks/useAuth.js
import { useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, token, loading, error, login, logout, register } = context;

  // Helper: Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Helper: Check if user has a specific role
  const hasRole = useCallback(
    (role) => {
      if (!user || !user.roles) return false;
      return user.roles.includes(role);
    },
    [user]
  );

  // Helper: Auto-refresh token if expired
  const refreshToken = useCallback(async () => {
    try {
      if (!token) return false;
      const res = await axios.post(
        "/api/auth/refresh-token",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update token in AuthContext
      context.login(user.email, user.password); // Or use a setToken function
      return true;
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      return false;
    }
  }, [token, user, context, logout]);

  return {
    user,
    token,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated,
    hasRole,
    refreshToken,
  };
};

export default useAuth;
