"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getAllMaterials,
  updateMaterialStatus,
} from "@/services/material-service";
import { addAdminLog } from "@/services/admin-service";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, MoreHorizontal, Package, XCircle } from "lucide-react";
import type { MaterialType } from "@/types/material";

export default function MaterialsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getAllMaterials();
        setMaterials(data);
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить список материалов",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterials();
  }, [toast]);

  const handleUpdateStatus = async (materialId: string, newStatus: string) => {
    try {
      await updateMaterialStatus(materialId, newStatus);

      // Обновляем список материалов
      setMaterials(
        materials.map((m) =>
          m.id === materialId ? { ...m, status: newStatus } : m
        )
      );

      // Логируем действие
      if (user) {
        await addAdminLog({
          userId: user.id,
          userName: user.name,
          action: "update_material_status",
          details: `Изменен статус материала ${materialId} на ${newStatus}`,
          ip: "127.0.0.1",
        });
      }

      toast({
        title: "Статус обновлен",
        description: `Статус материала успешно изменен на "${
          newStatus === "active"
            ? "Активен"
            : newStatus === "pending"
            ? "На проверке"
            : "Отклонен"
        }"`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус материала",
      });
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case "paper":
        return "Бумага";
      case "plastic":
        return "Пластик";
      case "glass":
        return "Стекло";
      case "metal":
        return "Металл";
      case "electronics":
        return "Электроника";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Загрузка материалов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Управление материалами</h1>
        <Badge variant="outline">{materials.length} материалов</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список материалов</CardTitle>
          <CardDescription>
            Управление материалами на платформе. Вы можете одобрять, отклонять и
            модерировать материалы.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Цена (₸/кг)</TableHead>
                <TableHead>Количество (кг)</TableHead>
                <TableHead>Продавец</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((material) => (
                <TableRow key={material.id}>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{getMaterialTypeLabel(material.type)}</TableCell>
                  <TableCell>{material.price}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>{material.userName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        material.status === "active"
                          ? "default"
                          : material.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className={
                        material.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {material.status === "active"
                        ? "Активен"
                        : material.status === "pending"
                        ? "На проверке"
                        : "Отклонен"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(material.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Меню</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {material.status !== "active" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(material.id, "active")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Одобрить</span>
                          </DropdownMenuItem>
                        )}
                        {material.status !== "rejected" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(material.id, "rejected")
                            }
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Отклонить</span>
                          </DropdownMenuItem>
                        )}
                        {material.status !== "pending" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(material.id, "pending")
                            }
                          >
                            <Package className="mr-2 h-4 w-4" />
                            <span>Вернуть на проверку</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
