"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
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
import { useFavorites } from "@/context/favorites-context";
import { useAuth } from "@/context/auth-context";
import type { MaterialType } from "@/types/material";

interface MaterialCardProps {
  material: MaterialType;
  showFavoriteButton?: boolean;
}

export function MaterialCard({
  material,
  showFavoriteButton = true,
}: MaterialCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, toggleFavorite, isToggling } = useFavorites();
  const [isHovered, setIsHovered] = useState(false);

  const isFavorite = favorites.includes(material.id);

  const handleMaterialClick = () => {
    router.push(`/marketplace/${material.id}`);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      router.push("/auth/login");
      return;
    }
    await toggleFavorite(material.id);
  };

  return (
    <Card
      className="overflow-hidden transition-all duration-200 hover:shadow-md"
      onClick={handleMaterialClick}
    >
      <div
        className="h-48 bg-muted bg-cover bg-center cursor-pointer relative"
        style={{
          backgroundImage: `url(${
            material.image || "/placeholder.svg?key=oxk1n"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {showFavoriteButton && user && (
          <div
            className={`absolute top-2 right-2 transition-opacity duration-200 ${
              isHovered || isFavorite ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              disabled={isToggling[material.id]}
              onClick={handleToggleFavorite}
              aria-label={
                isFavorite ? "Удалить из избранного" : "Добавить в избранное"
              }
            >
              {isToggling[material.id] ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              )}
            </Button>
          </div>
        )}
      </div>
      <CardHeader className="p-4 cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{material.name}</CardTitle>
            <CardDescription>{material.type}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 cursor-pointer">
        <p className="text-sm line-clamp-2">{material.description}</p>
      </CardContent>
      <CardFooter className="p-4 flex justify-between cursor-pointer">
        <Badge variant={material.dealType === "buy" ? "default" : "outline"}>
          {material.dealType === "buy" ? "Покупка" : "Продажа"}
        </Badge>
        <span className="font-bold">{material.price} ₸/кг</span>
      </CardFooter>
    </Card>
  );
}
