"use client";

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
import { Heart, Eye } from "lucide-react";

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isLoading && !user) {
        router.push("/auth/login");
        return;
      }

      if (!favoritesLoading && favorites.length > 0) {
        fetchFavoriteMaterials();
      } else if (!favoritesLoading) {
        setIsLoadingMaterials(false);
      }
    }
  }, [user, isLoading, router, favorites, favoritesLoading]);

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
            <Card key={material.id} className="overflow-hidden">
              <div
                className="h-48 bg-muted bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: `url(${material.image})` }}
                onClick={() => handleMaterialClick(material.id)}
              />
              <CardHeader className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div
                      className="cursor-pointer"
                      onClick={() => handleMaterialClick(material.id)}
                    >
                      <CardTitle className="text-lg">{material.name}</CardTitle>
                      <CardDescription>{material.type}</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(material.id);
                    }}
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
                <div className="flex items-center gap-2">
                  <span className="font-bold">{material.price} ₽/кг</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMaterialClick(material.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Просмотр
                  </Button>
                </div>
              </CardFooter>
            </Card>
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
