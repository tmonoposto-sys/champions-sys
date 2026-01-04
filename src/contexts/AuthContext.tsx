import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Championship {
  code: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  championship: Championship | null;
  username: string | null;
  login: (username: string, code: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "f1_admin_session";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [championship, setChampionship] = useState<Championship | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const session = JSON.parse(stored);
        setIsAuthenticated(true);
        setChampionship(session.championship);
        setUsername(session.username);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const login = (user: string, code: string, name: string) => {
    const session = {
      username: user,
      championship: { code, name },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setIsAuthenticated(true);
    setChampionship({ code, name });
    setUsername(user);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
    setChampionship(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, championship, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
