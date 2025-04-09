"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useFavorites } from "@/context/favorites-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { getMaterialById } from "@/services/material-service";
import { createApplication } from "@/services/application-service";
import type { MaterialType } from "@/types/material";
import {
  Heart,
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Package,
} from "lucide-react";

export function MaterialDetailClient({ materialId }: { materialId: string }) {
  const { user } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const router = useRouter();
  const { toast } = useToast();

  const [material, setMaterial] = useState<MaterialType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState("1");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const data = await getMaterialById(materialId);
        setMaterial(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить информацию о материале",
        });
        router.push("/marketplace");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId, router, toast]);

  const handleCreateApplication = async () => {
    if (!user || !material) return;

    setIsSubmitting(true);

    try {
      await createApplication({
        title: `Заявка на ${
          material.dealType === "buy" ? "продажу" : "покупку"
        } ${material.name}`,
        description:
          message ||
          `Заявка на ${material.dealType === "buy" ? "продажу" : "покупку"} ${
            material.name
          } в количестве ${quantity} кг`,
        materialType: material.type,
        quantity: Number(quantity),
        price: material.price,
        userId: user.id,
      });

      toast({
        title: "Заявка создана",
        description: "Ваша заявка была успешно создана",
      });

      setIsDialogOpen(false);
      setQuantity("1");
      setMessage("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать заявку",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            Загрузка информации о материале...
          </p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="container py-10">
        <div className="text-center py-20">
          <p className="text-muted-foreground">Материал не найден</p>
          <Button className="mt-4" onClick={() => router.push("/marketplace")}>
            Вернуться на витрину
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push("/marketplace")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к витрине
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="h-[300px] md:h-[400px] bg-muted bg-cover bg-center rounded-lg"
          style={{ backgroundImage: `url(${material.image})` }}
        />

        <div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{material.name}</h1>
              <p className="text-muted-foreground">{material.type}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleFavorite(material.id)}
            >
              <Heart
                className={`h-6 w-6 ${
                  favorites.includes(material.id)
                    ? "fill-primary text-primary"
                    : ""
                }`}
              />
            </Button>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-bold">{material.price} ₽/кг</h2>
            <Badge
              variant={material.dealType === "buy" ? "default" : "outline"}
              className="mt-2"
            >
              {material.dealType === "buy" ? "Покупка" : "Продажа"}
            </Badge>

            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  Пользователь: {material.userName}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  Дата публикации:{" "}
                  {new Date(material.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center">
                <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">
                  Доступное количество: {material.quantity} кг
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Местоположение: Москва</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Описание</h3>
            <p>{material.description}</p>
          </div>

          <div className="mt-6">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  {material.dealType === "buy"
                    ? "Продать материал"
                    : "Купить материал"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {material.dealType === "buy"
                      ? "Продажа материала"
                      : "Покупка материала"}
                  </DialogTitle>
                  <DialogDescription>
                    Заполните форму для создания заявки на{" "}
                    {material.dealType === "buy" ? "продажу" : "покупку"}{" "}
                    материала
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Количество (кг)</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      max={material.quantity.toString()}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message">Сообщение (необязательно)</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Укажите дополнительную информацию, если необходимо"
                    />
                  </div>
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Итоговая стоимость</p>
                    <p className="text-lg font-bold">
                      {material.price * Number(quantity)} ₽
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleCreateApplication}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Создание..." : "Создать заявку"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
