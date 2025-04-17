"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Heart, Search } from "lucide-react";
import { useFavorites } from "@/context/favorites-context";
import type { MaterialType } from "@/types/material";

import {
  MATERIAL_CATEGORIES,
  MaterialCategory,
} from "@/constants/materialCategories";

export default function MarketplacePage() {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialType[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [deal_type, setdeal_type] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/materials`
        );

        if (!response.ok) {
          throw new Error("Не удалось загрузить материалы");
        }

        const data = await response.json();
        setMaterials(data);
        setFilteredMaterials(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Произошла ошибка");
        console.error("Ошибка при загрузке материалов:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    let result = materials;

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (material) =>
          material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (material.description &&
            material.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (category !== "all") {
      const categoryNum = parseInt(category);
      result = result.filter((material) => material.category === categoryNum);
    }

    // Filter by deal type
    if (deal_type !== "all") {
      result = result.filter((material) => material.deal_type === deal_type);
    }

    // Filter by price range
    result = result.filter(
      (material) =>
        material.price >= priceRange[0] && material.price <= priceRange[1]
    );

    setFilteredMaterials(result);
  }, [searchQuery, category, deal_type, priceRange, materials]);

  const handleMaterialClick = (id: number) => {
    router.push(`/marketplace/${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    toggleFavorite(id.toString());
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <p>Загрузка материалов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Витрина вторсырья</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Категория</label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {Object.entries(MATERIAL_CATEGORIES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Тип сделки</label>
                <Select
                  value={deal_type}
                  onValueChange={(value) => setdeal_type(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Все типы" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="sell">Продажа</SelectItem>
                    <SelectItem value="buy">Покупка</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Цена за {materials[0]?.unit || "кг"} (₸)
                </label>
                <div className="pt-5">
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                  <div className="flex justify-between mt-2">
                    <span>{priceRange[0]} ₸</span>
                    <span>{priceRange[1]} ₸</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск материалов..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Tabs
                value={deal_type}
                onValueChange={(value) => setdeal_type(value)}
              >
                <TabsList>
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="buy">Покупка</TabsTrigger>
                  <TabsTrigger value="sell">Продажа</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <Card
                    key={material.id}
                    className="overflow-hidden relative hover:shadow-lg transition-shadow"
                  >
                    <div
                      className="h-48 bg-muted bg-cover bg-center"
                      style={{
                        backgroundImage: material.image_url
                          ? `url(${material.image_url})`
                          : "none",
                      }}
                    />
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {material.name}
                          </CardTitle>
                          <CardDescription>
                            {
                              MATERIAL_CATEGORIES[
                                material.category as MaterialCategory
                              ]
                            }
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleFavoriteClick(e, material.id)}
                          className="z-10"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.includes(material.id.toString())
                                ? "fill-primary text-primary"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm line-clamp-2">
                        {material.description || "Описание отсутствует"}
                      </p>
                      <div className="mt-2 text-sm">
                        <p>
                          <span className="font-medium">Количество:</span>{" "}
                          {material.quantity} {material.unit}
                        </p>
                        <p>
                          <span className="font-medium">Местоположение:</span>{" "}
                          {material.location}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between">
                      <Badge
                        variant={
                          material.deal_type === "buy" ? "default" : "outline"
                        }
                      >
                        {material.deal_type === "buy" ? "Покупка" : "Продажа"}
                      </Badge>
                      <span className="font-bold">
                        {material.price} ₸/{material.unit}
                      </span>
                    </CardFooter>
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => handleMaterialClick(material.id)}
                    />
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">Материалы не найдены</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
