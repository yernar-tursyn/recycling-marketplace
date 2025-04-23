"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getMaterialById } from "@/services/material-service";
import type { MaterialType } from "@/types/material";
import { MaterialCard } from "@/components/material-card";

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const router = useRouter();

  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!authLoading && !user) {
        router.push("/auth/login");
        return;
      }

      if (!favoritesLoading && favorites.length > 0) {
        fetchFavoriteMaterials();
      } else if (!favoritesLoading) {
        setIsLoadingMaterials(false);
      }
    }
  }, [user, authLoading, router, favorites, favoritesLoading]);

  const fetchFavoriteMaterials = async () => {
    setIsLoadingMaterials(true);
    setError(null);

    try {
      const materialsData = await Promise.all(
        favorites.map(async (id) => {
          try {
            return await getMaterialById(id);
          } catch (error) {
            console.error(`Error fetching material ${id}:`, error);
            return null;
          }
        })
      );

      setMaterials(
        materialsData.filter(
          (material): material is MaterialType => material !== null
        )
      );
    } catch (error) {
      console.error("Error fetching favorite materials:", error);
      setError(
        "Не удалось загрузить избранные материалы. Пожалуйста, попробуйте позже."
      );
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Избранное</h1>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          <p>{error}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={fetchFavoriteMaterials}
          >
            Попробовать снова
          </Button>
        </div>
      )}

      {isLoadingMaterials || favoritesLoading ? (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">
            Загрузка избранных материалов...
          </p>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            У вас пока нет избранных материалов
          </p>
          <Button className="mt-4" onClick={() => router.push("/marketplace")}>
            Перейти на витрину
          </Button>
        </div>
      )}
    </div>
  );
}
