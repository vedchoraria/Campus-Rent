import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const USER_KEY = "campusRent_user";
const TOKEN_KEY = "campusRent_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = (authData) => {
    const userData = authData?.user;
    const jwt = authData?.token;
    if (!userData || !jwt) {
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, jwt);
    setUser(userData);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
