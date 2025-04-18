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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUserApplications,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  createApplicationStatusNotification,
} from "@/services/application-service";
import type { ApplicationType } from "@/types/application";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2 } from "lucide-react";

export default function ApplicationsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationType | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [materialType, setMaterialType] = useState("paper");
  const [quantity, setQuantity] = useState("0");
  const [price, setPrice] = useState("0");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isLoading && !user) {
        router.push("/auth/login");
        return;
      }

      if (user) {
        fetchApplications();
      }
    }
  }, [user, isLoading, router]);

  const fetchApplications = async () => {
    if (!user) return;

    try {
      const data = await getUserApplications(user.id, user.type);
      console.log("Загруженные заявки:", data);
      setApplications(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить заявки",
      });
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMaterialType("paper");
    setQuantity("0");
    setPrice("0");
  };

  const handleEditApplication = async () => {
    if (!selectedApplication) return;

    try {
      await updateApplication(selectedApplication.id, {
        title,
        description,
        materialType,
        quantity: Number(quantity),
        price: Number(price),
      });

      toast({
        title: "Заявка обновлена",
        description: "Ваша заявка была успешно обновлена",
      });

      resetForm();
      setIsEditing(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить заявку",
      });
    }
  };

  const handleDeleteApplication = async () => {
    if (!selectedApplication) return;

    try {
      await deleteApplication(selectedApplication.id);

      toast({
        title: "Заявка удалена",
        description: "Ваша заявка была успешно удалена",
      });

      setIsDeleting(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить заявку",
      });
    }
  };

  const openEditDialog = (application: ApplicationType) => {
    setSelectedApplication(application);
    setTitle(application.title);
    setDescription(application.description);
    setMaterialType(application.materialType);
    setQuantity(application.quantity.toString());
    setPrice(application.price.toString());
    setIsEditing(true);
  };

  const openDeleteDialog = (application: ApplicationType) => {
    setSelectedApplication(application);
    setIsDeleting(true);
  };

  const handleUpdateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const updatedApp = await updateApplicationStatus(
        applicationId,
        newStatus
      );

      fetchApplications();

      if (user) {
        await createApplicationStatusNotification(
          applicationId,
          updatedApp.title,
          updatedApp.userId,
          newStatus,
          user.id
        );
      }

      if (newStatus === "completed" && updatedApp.materialId) {
        try {
          const { updateMaterialQuantity } = await import(
            "@/services/material-service"
          );

          await updateMaterialQuantity(
            updatedApp.materialId,
            updatedApp.quantity
          );

          console.log(
            `Количество материала ${updatedApp.materialId} уменьшено на ${updatedApp.quantity}`
          );
        } catch (error) {
          console.error("Ошибка при обновлении количества материала:", error);
        }
      }

      toast({
        title:
          newStatus === "completed" ? "Заявка принята" : "Заявка отклонена",
        description:
          newStatus === "completed"
            ? "Заявка успешно принята. Покупатель получил уведомление."
            : "Заявка отклонена. Покупатель получил уведомление.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус заявки",
      });
    }
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {user.type === "seller" ? "Заявки на материалы" : "Мои заявки"}
          </h1>
          {user.type === "seller" ? (
            <p className="text-muted-foreground mt-1">
              Здесь вы можете просматривать и обрабатывать заявки от покупателей
              на ваши материалы
            </p>
          ) : (
            <p className="text-muted-foreground mt-1">
              Здесь вы можете просматривать и управлять своими заявками на
              покупку материалов
            </p>
          )}
        </div>
        {user.type === "buyer" && (
          <Button onClick={() => router.push("/marketplace")}>
            Перейти на витрину
          </Button>
        )}
      </div>

      {applications.length > 0 ? (
        <div className="grid gap-4">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">{application.title}</CardTitle>
                  <Badge
                    variant={
                      application.status === "active"
                        ? "default"
                        : application.status === "completed"
                        ? "secondary"
                        : application.status === "pending"
                        ? "outline"
                        : "secondary"
                    }
                    className={
                      application.status === "completed"
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {application.status === "active"
                      ? "Активна"
                      : application.status === "completed"
                      ? "Завершена"
                      : application.status === "pending"
                      ? user.type === "seller"
                        ? "На модерации"
                        : "На проверке"
                      : "Отменена"}
                  </Badge>
                </div>
                <CardDescription>
                  Создана:{" "}
                  {new Date(application.createdAt).toLocaleDateString()}
                  {user.type === "seller" && application.userId !== user.id && (
                    <span className="ml-2">(от покупателя)</span>
                  )}
                  {user.type === "seller" && application.userId === user.id && (
                    <span className="ml-2">(ваша заявка)</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{application.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Материал:{" "}
                    </span>
                    <span className="text-sm font-medium">
                      {application.materialType}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Количество:{" "}
                    </span>
                    <span className="text-sm font-medium">
                      {application.quantity} кг
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Цена:{" "}
                    </span>
                    <span className="text-sm font-medium">
                      {application.price} ₽/кг
                    </span>
                  </div>
                  {user.type === "seller" && application.userId !== user.id && (
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Покупатель:{" "}
                      </span>
                      <span className="text-sm font-medium">
                        {application.userName || "Пользователь"}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                {application.userId === user.id && (
                  <>
                    {application.status === "pending" && (
                      <Badge variant="secondary">На проверке</Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(application)}
                      disabled={
                        application.status !== "active" &&
                        application.status !== "pending"
                      }
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(application)}
                      disabled={
                        application.status !== "active" &&
                        application.status !== "pending"
                      }
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить
                    </Button>
                  </>
                )}
                {user.type === "seller" &&
                  application.userId !== user.id &&
                  application.status === "active" &&
                  application.sellerUserId === user.id && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleUpdateApplicationStatus(
                            application.id,
                            "cancelled"
                          )
                        }
                      >
                        Отклонить
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          handleUpdateApplicationStatus(
                            application.id,
                            "completed"
                          )
                        }
                      >
                        Принять
                      </Button>
                    </>
                  )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-muted-foreground">
            {user.type === "seller"
              ? "У вас пока нет заявок на материалы"
              : "У вас пока нет заявок на покупку материалов"}
          </p>
          {user.type === "buyer" && (
            <Button
              className="mt-4"
              onClick={() => router.push("/marketplace")}
            >
              Перейти на витрину
            </Button>
          )}
        </div>
      )}

      
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование заявки</DialogTitle>
            <DialogDescription>Измените данные вашей заявки</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Заголовок</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-material-type">Тип материала</Label>
              <Select value={materialType} onValueChange={setMaterialType}>
                <SelectTrigger id="edit-material-type">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Количество (кг)</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Цена (₽/кг)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Отмена
            </Button>
            <Button onClick={handleEditApplication}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление заявки</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить эту заявку? Это действие нельзя
              отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteApplication}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
