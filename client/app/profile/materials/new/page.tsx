"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createMaterial } from "@/services/material-service";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MaterialNewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("paper");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState<string>("/images/placeholder.jpg");
  const [dealType, setDealType] = useState("sell");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    } else if (!isLoading && user && user.type !== "seller") {
      router.push("/profile");
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только продавцы могут создавать материалы",
      });
    }
  }, [user, isLoading, router, toast]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Название материала обязательно";
    }

    if (!description.trim()) {
      errors.description = "Описание материала обязательно";
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = "Укажите корректную цену (больше 0)";
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      errors.quantity = "Укажите корректное количество (больше 0)";
    }

    setErrors(errors);

    if (Object.keys(errors).length > 0) {
      console.log("Validation errors:", errors);
    }

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!validateForm()) {
      console.log("Form validation failed with errors:", errors);
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Необходимо войти в систему",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const materialData = {
        name: name.trim(),
        type: type,
        description: description.trim(),
        price: Number(price),
        quantity: Number(quantity),
        image: image.trim() || "/images/placeholder.jpg",
        userId: user.id,
        dealType: dealType,
      };

      console.log("Creating material with data:", materialData);

      const newMaterial = await createMaterial(materialData);

      console.log("Material created successfully:", newMaterial);

      try {
        const { createMaterialNotification } = await import(
          "@/services/notification-service"
        );
        await createMaterialNotification(
          newMaterial.id,
          name,
          user.id,
          "pending"
        );
      } catch (error) {
        console.error("Error creating notification:", error);
      }

      toast({
        title: "Материал создан",
        description: "Ваш материал был успешно создан и отправлен на модерацию",
      });

      setTimeout(() => {
        router.push("/marketplace");
      }, 1000);
    } catch (error) {
      console.error("Error creating material:", error);

      let errorMessage =
        "Не удалось создать материал. Пожалуйста, попробуйте позже.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as any).message);
      }

      toast({
        variant: "destructive",
        title: "Ошибка создания материала",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || user.type !== "seller") {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Добавить новый материал</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Информация о материале</CardTitle>
            <CardDescription>
              Заполните информацию о вашем материале
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Название материала</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
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

              <div className="grid gap-2">
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

              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[100px]"
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Цена за кг (₸)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="quantity">Количество (кг)</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-500">{errors.quantity}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">URL изображения</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Укажите URL изображения или оставьте пустым для использования
                  изображения по умолчанию
                </p>
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
              {isSubmitting ? "Создание..." : "Создать материал"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
