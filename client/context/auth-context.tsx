"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  loginUser,
  registerUser,
  getUserProfile,
} from "@/services/auth-service";
import type { UserType } from "@/types/user";

interface AuthContextType {
  user: UserType | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    type: string
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  setAdminSession: (token: string) => void;
}

// Создаем контекст с начальным значением undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("[Auth Context] Initial token check:", !!token);

    if (token) {
      getUserProfile(token)
        .then((userData) => {
          console.log("[Auth Context] User profile loaded:", userData.name);
          setUser(userData);
        })
        .catch((error) => {
          console.log("[Auth Context] Error fetching user profile:", error);
          localStorage.removeItem("token");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      console.log("[Auth Context] No token found, not logged in");
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("[Auth Context] Login attempt for:", email);
      const { token, user } = await loginUser(email, password);

      if (token) {
        console.log("[Auth Context] Login successful, setting token and user");
        localStorage.setItem("token", token);
        setUser(user as UserType);
        return true;
      }

      console.log("[Auth Context] Login failed: No token received");
      return false;
    } catch (error) {
      console.log("[Auth Context] Login error:", error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    type: string
  ) => {
    try {
      const { token, user } = await registerUser(name, email, password, type);

      if (token) {
        localStorage.setItem("token", token);
        setUser(user as UserType);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    // Вызываем функцию logout из auth-service для очистки дополнительных данных
    import("@/services/auth-service").then(({ logout }) => logout());
    setUser(null);
  };

  const setAdminSession = (token: string) => {
    localStorage.setItem("admin_token", token);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, isLoading, setAdminSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
