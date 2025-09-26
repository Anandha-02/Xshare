// src/context/AuthContext.js
import React, { createContext, useReducer, useEffect } from "react";
import axios from "axios";

// 1️⃣ Create Context
export const AuthContext = createContext();

// 2️⃣ Initial State
const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

// 3️⃣ Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
      return { ...state, loading: true, error: null };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case "LOGIN_FAILURE":
    case "REGISTER_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "LOGOUT":
      return { user: null, token: null, loading: false, error: null };

    default:
      return state;
  }
};

// 4️⃣ AuthProvider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist user/token in localStorage
  useEffect(() => {
    if (state.user && state.token) {
      localStorage.setItem("user", JSON.stringify(state.user));
      localStorage.setItem("token", state.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [state.user, state.token]);

  // Login
  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const { data } = await axios.post("/api/auth/login", { email, password });
      dispatch({ type: "LOGIN_SUCCESS", payload: { user: data.user, token: data.token } });
      return true;
    } catch (err) {
      dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data?.message || err.message });
      return false;
    }
  };

  // Register
  const register = async (name, email, password) => {
    dispatch({ type: "REGISTER_START" });
    try {
      const { data } = await axios.post("/api/auth/register", { name, email, password });
      dispatch({ type: "REGISTER_SUCCESS", payload: { user: data.user, token: data.token } });
      return true;
    } catch (err) {
      dispatch({ type: "REGISTER_FAILURE", payload: err.response?.data?.message || err.message });
      return false;
    }
  };

  // Logout
  const logout = () => dispatch({ type: "LOGOUT" });

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
