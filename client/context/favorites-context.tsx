"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/auth-context";
import {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} from "@/services/favorites-service";
import { toast } from "@/components/ui/use-toast";

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (materialId: string) => Promise<void>;
  isFavorite: (materialId: string) => boolean;
  isLoading: boolean;
  isToggling: Record<string, boolean>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log("[Favorites Context] Fetching favorites for user:", user.id);
      const data = await getFavorites(user.id);
      console.log("[Favorites Context] Received favorites:", data);
      setFavorites(data);
    } catch (error) {
      console.error("[Favorites Context] Error fetching favorites:", error);
      toast({
        title: "Ошибка",
        description:
          "Не удалось загрузить избранное. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("[Favorites Context] Token exists:", !!token);

    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setIsLoading(false);
    }
  }, [user]);

  const isFavorite = (materialId: string): boolean => {
    return favorites.includes(materialId);
  };

  const toggleFavorite = async (materialId: string): Promise<void> => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description:
          "Пожалуйста, войдите в систему, чтобы добавить материал в избранное.",
        variant: "default",
      });
      return;
    }

    try {
      setIsToggling((prev) => ({ ...prev, [materialId]: true }));

      if (favorites.includes(materialId)) {
        setFavorites(favorites.filter((id) => id !== materialId));

        try {
          await removeFromFavorites(user.id, materialId);
          toast({
            title: "Успешно",
            description: "Материал удален из избранного",
            variant: "default",
          });
        } catch (error) {
          console.error(
            "[Favorites Context] Error removing from favorites:",
            error
          );
          setFavorites((prev) => [...prev, materialId]);

          const errorMessage =
            error instanceof Error
              ? error.message
              : "Не удалось удалить из избранного";
          toast({
            title: "Ошибка",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } else {
        setFavorites((prev) => [...prev, materialId]);

        try {
          await addToFavorites(user.id, materialId);
          toast({
            title: "Успешно",
            description: "Материал добавлен в избранное",
            variant: "default",
          });
        } catch (error) {
          console.error(
            "[Favorites Context] Error adding to favorites:",
            error
          );
          setFavorites((prev) => prev.filter((id) => id !== materialId));

          const errorMessage =
            error instanceof Error
              ? error.message
              : "Не удалось добавить в избранное";
          toast({
            title: "Ошибка",
            description: errorMessage,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("[Favorites Context] Error toggling favorite:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении избранного",
        variant: "destructive",
      });
    } finally {
      setIsToggling((prev) => ({ ...prev, [materialId]: false }));
    }
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        isLoading,
        isToggling,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }

  return context;
}
