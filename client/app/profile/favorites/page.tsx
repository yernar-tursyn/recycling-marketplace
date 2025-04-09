"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMaterialById } from "@/services/material-service";
import type { MaterialType } from "@/types/material";
import { Heart, ShoppingBag } from "lucide-react";

export default function FavoritesPage() {
  const { user, isLoading } = useAuth();
  const {
    favorites,
    toggleFavorite,
    isLoading: favoritesLoading,
  } = useFavorites();
  const router = useRouter();

  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // Эффект для перенаправления неавторизованных пользователей
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
  }, [user, isLoading, router]);

  // Эффект для загрузки избранных материалов
  useEffect(() => {
    if (user && !favoritesLoading) {
      if (favorites.length > 0) {
        fetchFavoriteMaterials();
      } else {
        setMaterials([]);
        setIsLoadingMaterials(false);
      }
    }
  }, [user, favorites, favoritesLoading]);

  const fetchFavoriteMaterials = async () => {
    setIsLoadingMaterials(true);

    try {
      const materialsData = await Promise.all(
        favorites.map((id) => getMaterialById(id))
      );
      setMaterials(materialsData);
    } catch (error) {
      console.error("Error fetching favorite materials:", error);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const handleMaterialClick = (id: string) => {
    router.push(`/marketplace/${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    // Останавливаем всплытие события, чтобы не срабатывал клик по карточке
    e.stopPropagation();
    toggleFavorite(id);
  };

  if (isLoading || favoritesLoading || !user) {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Избранное</h1>

      {isLoadingMaterials ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            Загрузка избранных материалов...
          </p>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="overflow-hidden relative">
              <div
                className="h-48 bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url(${material.image})` }}
              />
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{material.name}</CardTitle>
                    <CardDescription>{material.type}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleFavoriteClick(e, material.id)}
                    className="z-10"
                  >
                    <Heart className="h-5 w-5 fill-primary text-primary" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm line-clamp-2">{material.description}</p>
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                <Badge
                  variant={material.dealType === "buy" ? "default" : "outline"}
                >
                  {material.dealType === "buy" ? "Покупка" : "Продажа"}
                </Badge>
                <span className="font-bold">{material.price} ₸/кг</span>
              </CardFooter>
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => handleMaterialClick(material.id)}
              />
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            В избранном нет товаров
          </h2>
          <p className="text-muted-foreground mb-6">
            Добавляйте товары в избранное, чтобы быстро находить их в будущем
          </p>
          <Button size="lg" onClick={() => router.push("/marketplace")}>
            Перейти на витрину
          </Button>
        </div>
      )}
    </div>
  );
}
