"use client";

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
import { Badge } from "@/components/ui/badge";
import { getUserMaterials, deleteMaterial } from "@/services/material-service";
import type { MaterialType } from "@/types/material";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isLoading && !user) {
        router.push("/auth/login");
        return;
      }

      if (user && user.type !== "seller") {
        router.push("/profile");
        return;
      }

      if (user) {
        fetchMaterials();
      }
    }
  }, [user, isLoading, router]);

  const fetchMaterials = async () => {
    if (!user) return;

    setIsLoadingMaterials(true);

    try {
      const data = await getUserMaterials(user.id);
      setMaterials(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить материалы",
      });
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;

    try {
      await deleteMaterial(selectedMaterial.id);

      toast({
        title: "Материал удален",
        description: "Материал был успешно удален",
      });

      setIsDeleteDialogOpen(false);
      fetchMaterials();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить материал",
      });
    }
  };

  if (isLoading || !user || user.type !== "seller") {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Мои материалы</h1>
        <Button onClick={() => router.push("/profile/materials/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить материал
        </Button>
      </div>

      {isLoadingMaterials ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Загрузка материалов...</p>
        </div>
      ) : materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              <div
                className="h-48 bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url(${material.image})` }}
              />
              <CardHeader className="p-4">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{material.name}</CardTitle>
                  <Badge
                    variant={
                      material.status === "active"
                        ? "default"
                        : material.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {material.status === "active"
                      ? "Активен"
                      : material.status === "pending"
                      ? "На проверке"
                      : "Отклонен"}
                  </Badge>
                </div>
                <CardDescription>{material.type}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm line-clamp-2 mb-2">
                  {material.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{material.price} ₽/кг</span>
                  <span>Количество: {material.quantity} кг</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/marketplace/${material.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Просмотр
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/profile/materials/edit/${material.id}`)
                    }
                    disabled={
                      material.status !== "active" &&
                      material.status !== "pending"
                    }
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Редактировать
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedMaterial(material);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">У вас пока нет материалов</p>
          <Button
            className="mt-4"
            onClick={() => router.push("/profile/materials/new")}
          >
            Добавить материал
          </Button>
        </div>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление материала</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить материал "{selectedMaterial?.name}
              "? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteMaterial}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
