"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMaterialById, updateMaterial } from "@/services/material-service";
import { useToast } from "@/components/ui/use-toast";
import type { MaterialType } from "@/types/material";

export default function EditMaterialPage({
  params,
}: {
  params: { id: string };
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const materialId = params.id;

  const [material, setMaterial] = useState<MaterialType | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState("");
  const [dealType, setDealType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading2, setIsLoading2] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user && user.type !== "seller") {
      router.push("/profile");
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только продавцы могут редактировать материалы",
      });
      return;
    }

    const fetchMaterial = async () => {
      try {
        const data = await getMaterialById(materialId);

        if (data.userId !== user?.id) {
          router.push("/profile/materials");
          toast({
            variant: "destructive",
            title: "Доступ запрещен",
            description: "Вы можете редактировать только свои материалы",
          });
          return;
        }

        setMaterial(data);
        setName(data.name);
        setType(data.type);
        setDescription(data.description);
        setPrice(data.price.toString());
        setQuantity(data.quantity.toString());
        setImage(data.image);
        setDealType(data.dealType);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить информацию о материале",
        });
        router.push("/profile/materials");
      } finally {
        setIsLoading2(false);
      }
    };

    if (user) {
      fetchMaterial();
    }
  }, [user, isLoading, router, materialId, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Название обязательно";
    }

    if (!description.trim()) {
      newErrors.description = "Описание обязательно";
    }

    if (!price || Number(price) <= 0) {
      newErrors.price = "Укажите корректную цену";
    }

    if (!quantity || Number(quantity) <= 0) {
      newErrors.quantity = "Укажите корректное количество";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !material) return;

    setIsSubmitting(true);

    try {
      await updateMaterial(materialId, {
        name,
        type,
        description,
        price: Number(price),
        quantity: Number(quantity),
        image,
        dealType,
      });

      toast({
        title: "Материал обновлен",
        description: "Ваш материал был успешно обновлен",
      });

      router.push("/profile/materials");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить материал",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoading2 || !user || user.type !== "seller" || !material) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Редактирование материала</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Информация о материале</CardTitle>
            <CardDescription>
              Измените информацию о вашем материале
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название материала</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Тип материала</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Выберите тип материала" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paper">Бумага</SelectItem>
                    <SelectItem value="plastic">Пластик</SelectItem>
                    <SelectItem value="glass">Стекло</SelectItem>
                    <SelectItem value="metal">Металл</SelectItem>
                    <SelectItem value="electronics">Электроника</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dealType">Тип сделки</Label>
                <Select value={dealType} onValueChange={setDealType}>
                  <SelectTrigger id="dealType">
                    <SelectValue placeholder="Выберите тип сделки" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sell">Продажа (я продаю)</SelectItem>
                    <SelectItem value="buy">Покупка (я покупаю)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Цена за кг (₽)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Количество (кг)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image">URL изображения</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/profile/materials")}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
