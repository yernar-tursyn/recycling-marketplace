"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/context/auth-context"
import { getFavorites, addToFavorites, removeFromFavorites } from "@/services/favorites-service"

interface FavoritesContextType {
  favorites: string[]
  toggleFavorite: (materialId: string) => void
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        try {
          const data = await getFavorites(user.id)
          setFavorites(data)
        } catch (error) {
          console.error("Error fetching favorites:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchFavorites()
    } else {
      setFavorites([])
      setIsLoading(false)
    }
  }, [user])

  const toggleFavorite = async (materialId: string) => {
    if (!user) return

    try {
      if (favorites.includes(materialId)) {
        await removeFromFavorites(user.id, materialId)
        setFavorites(favorites.filter((id) => id !== materialId))
      } else {
        await addToFavorites(user.id, materialId)
        setFavorites([...favorites, materialId])
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isLoading }}>{children}</FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)

  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }

  return context
}

