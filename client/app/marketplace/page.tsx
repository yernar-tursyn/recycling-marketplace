"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Loader2, Search, Filter, X } from "lucide-react";
import { getMaterials } from "@/services/material-service";
import type { MaterialType } from "@/types/material";
import { MaterialCard } from "@/components/material-card";

const getMaterialTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    plastic: "Пластик",
    paper: "Бумага",
    glass: "Стекло",
    metal: "Металл",
    textile: "Текстиль",
    organic: "Органика",
    other: "Другое",
  };
  return typeMap[type] || type;
};

export default function MarketplacePage() {
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<MaterialType[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [materialType, setMaterialType] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const router = useRouter();

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getMaterials();

        const activeMaterials = data.filter(
          (material) => material.status === "active"
        );

        setMaterials(activeMaterials);
        setFilteredMaterials(activeMaterials);
      } catch (error) {
        console.error("Error fetching materials:", error);
        setError(
          "Не удалось загрузить материалы. Пожалуйста, попробуйте позже."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const availableMaterialTypes = useMemo(() => {
    const types = new Set<string>();
    materials.forEach((material) => {
      if (material.type) {
        types.add(material.type);
      }
    });

    const typeOptions = Array.from(types).map((type) => ({
      value: type,
      label: getMaterialTypeLabel(type),
    }));

    typeOptions.sort((a, b) => a.label.localeCompare(b.label));

    return [{ value: "all", label: "Все типы" }, ...typeOptions];
  }, [materials]);

  const maxPrice = useMemo(() => {
    if (materials.length === 0) return 1000;
    const max = Math.max(...materials.map((m) => m.price || 0));
    return Math.ceil(max / 100) * 100;
  }, [materials]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  useEffect(() => {
    let result = [...materials];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (material) =>
          material.name?.toLowerCase().includes(query) ||
          material.description?.toLowerCase().includes(query) ||
          material.type?.toLowerCase().includes(query)
      );
    }

    if (materialType !== "all") {
      result = result.filter((material) => material.type === materialType);
    }

    result = result.filter(
      (material) =>
        material.price !== undefined &&
        material.price >= priceRange[0] &&
        material.price <= priceRange[1]
    );

    setFilteredMaterials(result);
  }, [materials, searchQuery, materialType, priceRange]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setMaterialType("all");
    setPriceRange([0, maxPrice]);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Витрина материалов</h1>

      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
        {/* Фильтры */}
        <Card className="h-fit">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Фильтры</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="search"
                  className="text-sm font-medium mb-1 block"
                >
                  Поиск
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Название, описание..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="material-type"
                  className="text-sm font-medium mb-1 block"
                >
                  Тип материала
                </label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger id="material-type">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMaterialTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Цена за кг (₸)
                </label>
                <Slider
                  defaultValue={[0, maxPrice]}
                  max={maxPrice}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) =>
                    setPriceRange(value as [number, number])
                  }
                  className="mb-2"
                />
                <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                  <span>{priceRange[0]} ₸</span>
                  <span>{priceRange[1]} ₸</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
                onClick={handleClearFilters}
              >
                <X className="mr-2 h-4 w-4" />
                Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Список материалов */}
        <div>
          <Tabs defaultValue="grid" className="mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {filteredMaterials.length}{" "}
                {filteredMaterials.length === 1 ? "материал" : "материалов"}
              </div>
              <TabsList>
                <TabsTrigger value="grid">Сетка</TabsTrigger>
                <TabsTrigger value="list">Список</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Попробовать снова
                  </Button>
                </div>
              ) : filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMaterials.map((material) => (
                    <MaterialCard key={material.id} material={material} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Материалы не найдены</h3>
                  <p className="text-muted-foreground mt-1">
                    Попробуйте изменить параметры фильтрации или поисковый
                    запрос
                  </p>
                  <Button className="mt-4" onClick={handleClearFilters}>
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-destructive mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Попробовать снова
                  </Button>
                </div>
              ) : filteredMaterials.length > 0 ? (
                <div className="space-y-4">
                  {filteredMaterials.map((material) => (
                    <Card
                      key={material.id}
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/marketplace/${material.id}`)}
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div
                          className="h-40 sm:h-auto sm:w-40 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${
                              material.image || "/placeholder.svg?key=oxk1n"
                            })`,
                          }}
                        />
                        <div className="p-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {material.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {getMaterialTypeLabel(material.type || "other")}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">
                                {material.price} ₸/кг
                              </span>
                            </div>
                          </div>
                          <p className="mt-2 text-sm line-clamp-2">
                            {material.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Материалы не найдены</h3>
                  <p className="text-muted-foreground mt-1">
                    Попробуйте изменить параметры фильтрации или поисковый
                    запрос
                  </p>
                  <Button className="mt-4" onClick={handleClearFilters}>
                    Сбросить фильтры
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
