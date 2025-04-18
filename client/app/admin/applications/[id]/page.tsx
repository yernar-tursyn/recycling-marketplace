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
import { Separator } from "@/components/ui/separator";
import {
  getApplicationById,
  updateApplicationStatus,
} from "@/services/application-service";
import { getUserById } from "@/services/user-service";
import { addAdminLog } from "@/services/admin-service";
import { createApplicationStatusNotification } from "@/services/notification-service";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Package,
  User,
  XCircle,
} from "lucide-react";
import type { ApplicationType } from "@/types/application";
import type { UserType } from "@/types/user";

export default function ApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [application, setApplication] = useState<ApplicationType | null>(null);
  const [applicantUser, setApplicantUser] = useState<Partial<UserType> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const applicationData = await getApplicationById(params.id);
        setApplication(applicationData);

        if (applicationData.userId) {
          const userData = await getUserById(applicationData.userId);
          setApplicantUser(userData);
        }
      } catch (error) {
        console.error("Error fetching application data:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные заявки",
        });
        router.push("/admin/applications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.id, router, toast]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!application || !user) return;

    setIsProcessing(true);

    try {
      const updatedApp = await updateApplicationStatus(
        application.id,
        newStatus
      );
      setApplication({ ...application, status: newStatus });

      await createApplicationStatusNotification(
        application.id,
        application.title,
        application.userId,
        newStatus,
        user.id
      );

      await addAdminLog({
        userId: user.id,
        userName: user.name,
        action: "update_application_status",
        details: `Изменен статус заявки ${application.id} на ${newStatus}`,
        ip: "127.0.0.1",
      });

      toast({
        title: "Статус обновлен",
        description: `Статус заявки успешно изменен на "${
          newStatus === "active"
            ? "Активна"
            : newStatus === "completed"
            ? "Завершена"
            : "Отменена"
        }"`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус заявки",
      });
    } finally {
      setIsProcessing(false);
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
        <p className="text-muted-foreground">Загрузка данных заявки...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/applications")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад к списку заявок
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">Заявка не найдена</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/admin/applications")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад к списку заявок
      </Button>

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Детали заявки</h1>
        <Badge
          variant={
            application.status === "active"
              ? "default"
              : application.status === "completed"
              ? "secondary"
              : "destructive"
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
            : "Отменена"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{application.title}</CardTitle>
            <CardDescription>
              Создана: {new Date(application.createdAt).toLocaleDateString()}{" "}
              {new Date(application.createdAt).toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Описание</h3>
              <p>{application.description}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Тип материала
                </h3>
                <p className="font-medium">
                  {getMaterialTypeLabel(application.materialType)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Количество
                </h3>
                <p className="font-medium">{application.quantity} кг</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Цена
                </h3>
                <p className="font-medium">{application.price} ₸/кг</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Общая стоимость
                </h3>
                <p className="font-medium">
                  {application.price * application.quantity} ₸
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="text-lg font-medium">История изменений</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">Создана:</span>{" "}
                      {new Date(application.createdAt).toLocaleDateString()}{" "}
                      {new Date(application.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {application.updatedAt &&
                  application.updatedAt !== application.createdAt && (
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Обновлена:</span>{" "}
                          {new Date(application.updatedAt).toLocaleDateString()}{" "}
                          {new Date(application.updatedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {application.status !== "cancelled" && (
              <Button
                variant="destructive"
                onClick={() => handleUpdateStatus("cancelled")}
                disabled={isProcessing}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Отменить заявку
              </Button>
            )}
            {application.status !== "completed" &&
              application.status !== "cancelled" && (
                <Button
                  variant="default"
                  className="bg-green-500 hover:bg-green-600"
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={isProcessing}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Завершить заявку
                </Button>
              )}
            {application.status !== "active" && (
              <Button
                variant="outline"
                onClick={() => handleUpdateStatus("active")}
                disabled={isProcessing}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Активировать
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о пользователе</CardTitle>
              <CardDescription>
                Данные пользователя, создавшего заявку
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {applicantUser ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{applicantUser.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {applicantUser.email}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Тип пользователя:</span>{" "}
                          {applicantUser.type === "buyer"
                            ? "Покупатель"
                            : "Продавец"}
                        </p>
                      </div>
                    </div>
                    {applicantUser.location && (
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">Местоположение:</span>{" "}
                            {applicantUser.location}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">Дата регистрации:</span>{" "}
                          {new Date(
                            applicantUser.createdAt || ""
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  Информация о пользователе недоступна
                </p>
              )}
            </CardContent>
            <CardFooter>
              {applicantUser && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/admin/users/${applicantUser.id}`)
                  }
                >
                  <User className="mr-2 h-4 w-4" />
                  Профиль пользователя
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
              <CardDescription>Управление заявкой</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  toast({
                    title: "Уведомление отправлено",
                    description:
                      "Пользователь получит уведомление о необходимости связаться с вами",
                  });
                }}
              >
                Связаться с пользователем
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
