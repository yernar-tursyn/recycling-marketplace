"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { loginUser, registerUser, getUserProfile } from "@/services/auth-service"
import type { UserType } from "@/types/user"

interface AuthContextType {
  user: UserType | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, type: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      getUserProfile(token)
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem("token")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { token, user } = await loginUser(email, password)

      if (token) {
        localStorage.setItem("token", token)
        setUser(user)
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  const register = async (name: string, email: string, password: string, type: string) => {
    try {
      const { token, user } = await registerUser(name, email, password, type)

      if (token) {
        localStorage.setItem("token", token)
        setUser(user)
        return true
      }

      return false
    } catch (error) {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

