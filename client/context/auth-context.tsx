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
  forceUpdateUserTypeFromServer,
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
  refreshUserType: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          console.log("[Auth Context] User type:", userData.type);
          setUser(userData);

          forceUpdateUserTypeFromServer()
            .then((updated) => {
              if (updated) {
                getUserProfile(token)
                  .then((updatedUserData) => {
                    console.log(
                      "[Auth Context] User profile updated after type check:",
                      updatedUserData.name
                    );
                    console.log(
                      "[Auth Context] Updated user type:",
                      updatedUserData.type
                    );
                    setUser(updatedUserData);
                  })
                  .catch((error) => {
                    console.error(
                      "[Auth Context] Error updating user after type check:",
                      error
                    );
                  });
              }
            })
            .catch((error) => {
              console.error(
                "[Auth Context] Error checking user type on server:",
                error
              );
            });
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
        console.log(
          "[Auth Context] Login successful, setting token and user:",
          user
        );
        console.log("[Auth Context] User type:", user.type);
        localStorage.setItem("token", token);

        if (user.type) localStorage.setItem("user_type", user.type);
        if (user.role) localStorage.setItem("user_role", user.role);

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
      const response = await registerUser(name, email, password, type);
      return response.success;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user_role");
    import("@/services/auth-service").then(({ logout }) => logout());
    setUser(null);
  };

  const setAdminSession = (token: string) => {
    localStorage.setItem("admin_token", token);
  };

  const refreshUserType = async () => {
    const updated = await forceUpdateUserTypeFromServer();

    if (updated && user) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const updatedUserData = await getUserProfile(token);
          setUser(updatedUserData);
          return true;
        } catch (error) {
          console.error(
            "[Auth Context] Error updating user after type refresh:",
            error
          );
          return false;
        }
      }
    }

    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoading,
        setAdminSession,
        refreshUserType,
      }}
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
