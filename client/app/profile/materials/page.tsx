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
import { getUserMaterials } from "@/services/material-service";
import type { MaterialType } from "@/types/material";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function UserMaterialsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        description: "Только продавцы могут просматривать свои материалы",
      });
      return;
    }

    const fetchMaterials = async () => {
      try {
        if (!user) return;

        setError(null);
        console.log("Fetching materials for user:", user.id);
        const data = await getUserMaterials(user.id);
        console.log("Fetched materials:", data);

        setMaterials(data);
      } catch (error) {
        console.error("Error fetching materials:", error);
        setError(
          "Не удалось загрузить материалы. Пожалуйста, попробуйте позже."
        );
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить материалы",
        });
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    if (user) {
      fetchMaterials();
    }
  }, [user, isLoading, router, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Активен</Badge>;
      case "pending":
        return <Badge variant="secondary">На модерации</Badge>;
      case "rejected":
        return <Badge variant="destructive">Отклонен</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading || isLoadingMaterials) {
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Мои материалы</h1>
        <Button onClick={() => router.push("/profile/materials/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить материал
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              <div
                className="h-40 bg-muted bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: `url(${material.image})` }}
                onClick={() => router.push(`/marketplace/${material.id}`)}
              />
              <CardHeader
                className="p-4 cursor-pointer"
                onClick={() => router.push(`/marketplace/${material.id}`)}
              >
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{material.name}</CardTitle>
                  {getStatusBadge(material.status)}
                </div>
                <CardDescription>{material.type}</CardDescription>
              </CardHeader>
              <CardContent
                className="p-4 pt-0 cursor-pointer"
                onClick={() => router.push(`/marketplace/${material.id}`)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold">{material.price} ₸/кг</span>
                  <span>Количество: {material.quantity} кг</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 border-t flex justify-end space-x-2">
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
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            У вас пока нет материалов на продажу
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/profile/materials/new")}
          >
            Добавить материал
          </Button>
        </div>
      )}
    </div>
  );
}
