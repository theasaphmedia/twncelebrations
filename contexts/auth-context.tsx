"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

interface AuthContextType {
  isAuthenticated: boolean
  user: string | null
  role: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("twn-auth")
    if (stored) {
      const { isAuthenticated, user, role } = JSON.parse(stored)
      setIsAuthenticated(isAuthenticated)
      setUser(user)
      setRole(role)
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single()

      if (error || !data) return false

      setIsAuthenticated(true)
      setUser(data.username)
      setRole(data.role)
      localStorage.setItem("twn-auth", JSON.stringify({
        isAuthenticated: true,
        user: data.username,
        role: data.role,
      }))
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setRole(null)
    localStorage.removeItem("twn-auth")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}