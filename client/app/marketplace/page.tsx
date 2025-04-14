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
import { getMaterials } from "@/services/material-service";
import type { MaterialType } from "@/types/material";

export default function MarketplacePage() {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialType[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [materialType, setMaterialType] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  useEffect(() => {
    const fetchMaterials = async () => {
      const data = await getMaterials();
      setMaterials(data);
      setFilteredMaterials(data);
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
          material.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by material type
    if (materialType !== "all") {
      result = result.filter((material) => material.type === materialType);
    }

    // Filter by price range
    result = result.filter(
      (material) =>
        material.price >= priceRange[0] && material.price <= priceRange[1]
    );

    setFilteredMaterials(result);
  }, [searchQuery, materialType, priceRange, materials]);

  const handleMaterialClick = (id: string) => {
    router.push(`/marketplace/${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent, id: string) => {
    // Останавливаем всплытие события, чтобы не срабатывал клик по карточке
    e.stopPropagation();
    toggleFavorite(id);
  };

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
                <label className="text-sm font-medium">Тип материала</label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="plastic">Пластик</SelectItem>
                    <SelectItem value="paper">Бумага</SelectItem>
                    <SelectItem value="glass">Стекло</SelectItem>
                    <SelectItem value="metal">Металл</SelectItem>
                    <SelectItem value="electronics">Электроника</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Цена за кг (₸)</label>
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

              <Tabs defaultValue="all">
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
                  <Card key={material.id} className="overflow-hidden relative">
                    <div
                      className="h-48 bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${material.image})` }}
                    />
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {material.name}
                          </CardTitle>
                          <CardDescription>{material.type}</CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleFavoriteClick(e, material.id)}
                          className="z-10"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              favorites.includes(material.id)
                                ? "fill-primary text-primary"
                                : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm line-clamp-2">
                        {material.description}
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 flex justify-between">
                      <Badge
                        variant={
                          material.type === "buy" ? "default" : "outline"
                        }
                      >
                        {material.type === "buy" ? "Покупка" : "Продажа"}
                      </Badge>
                      <span className="font-bold">{material.price} ₸/кг</span>
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
