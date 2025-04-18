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
import { createMaterial } from "@/services/material-service";
import { createMaterialNotification } from "@/services/notification-service";
import { useToast } from "@/components/ui/use-toast";

export default function NewMaterialPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [type, setType] = useState("paper");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState("/placeholder.svg?height=300&width=400");
  const [dealType, setDealType] = useState("sell");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        description: "Только продавцы могут добавлять материалы",
      });
    }
  }, [user, isLoading, router, toast]);

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

    if (!validateForm() || !user) return;

    setIsSubmitting(true);

    try {
      const material = await createMaterial({
        name,
        type,
        description,
        price: Number(price),
        quantity: Number(quantity),
        image,
        userId: user.id,
        userName: user.name,
        dealType,
      });

      await createMaterialNotification(
        material.id,
        material.name,
        user.id,
        "pending"
      );

      toast({
        title: "Материал добавлен",
        description:
          "Ваш материал был успешно добавлен и отправлен на проверку",
      });

      router.push("/profile/materials");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить материал",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !user || user.type !== "seller") {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Добавление нового материала</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Информация о материале</CardTitle>
            <CardDescription>
              Заполните форму для добавления нового материала на платформу
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
                  placeholder="Например: ПЭТ бутылки"
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
                <Label htmlFor="price">Цена за кг (₸)</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
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
                  placeholder="0"
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
                  placeholder="Подробное описание материала"
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
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Укажите URL изображения материала. Если оставить пустым, будет
                  использовано изображение по умолчанию.
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
              {isSubmitting ? "Добавление..." : "Добавить материал"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
