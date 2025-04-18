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
  getAllApplications,
  updateApplicationStatus,
} from "@/services/application-service";
import { addAdminLog } from "@/services/admin-service";
import { createApplicationStatusNotification } from "@/services/notification-service";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, MoreHorizontal, XCircle, Eye } from "lucide-react";
import type { ApplicationType } from "@/types/application";
import { useRouter } from "next/navigation";
import { getAllUsers } from "@/services/user-service";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllApplications();
        setApplications(data);

        const usersData = await getAllUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const getUserTypeFromId = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.type : "unknown";
  };

  const handleUpdateStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const updatedApp = await updateApplicationStatus(
        applicationId,
        newStatus
      );

      setApplications(
        applications.map((a) =>
          a.id === applicationId ? { ...a, status: newStatus } : a
        )
      );

      if (user) {
        await createApplicationStatusNotification(
          applicationId,
          updatedApp.title,
          updatedApp.userId,
          newStatus,
          user.id
        );
      }

      if (user) {
        await addAdminLog({
          userId: user.id,
          userName: user.name,
          action: "update_application_status",
          details: `Изменен статус заявки ${applicationId} на ${newStatus}`,
          ip: "127.0.0.1",
        });
      }

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
        <p className="text-muted-foreground">Загрузка заявок...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Управление заявками</h1>
        <Badge variant="outline">{applications.length} заявок</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список заявок</CardTitle>
          <CardDescription>
            Управление заявками на платформе. Вы можете изменять статусы заявок
            и модерировать их.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заголовок</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Тип материала</TableHead>
                <TableHead>Количество (кг)</TableHead>
                <TableHead>Цена (₽/кг)</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.title}
                    </TableCell>
                    <TableCell>
                      {application.userName || "Пользователь"}
                      {application.userId && (
                        <Badge variant="outline" className="ml-2">
                          {getUserTypeFromId(application.userId) === "seller"
                            ? "Продавец"
                            : "Покупатель"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {getMaterialTypeLabel(application.materialType)}
                    </TableCell>
                    <TableCell>{application.quantity}</TableCell>
                    <TableCell>{application.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          application.status === "active"
                            ? "default"
                            : application.status === "completed"
                            ? "secondary"
                            : application.status === "pending"
                            ? "outline"
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
                          : application.status === "pending"
                          ? "Ожидает модерации"
                          : "Отменена"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(application.createdAt).toLocaleDateString()}
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
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/admin/applications/${application.id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Просмотреть детали</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {application.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(application.id, "active")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Активировать</span>
                            </DropdownMenuItem>
                          )}
                          {application.status !== "completed" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(application.id, "completed")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              <span>Завершить</span>
                            </DropdownMenuItem>
                          )}
                          {application.status !== "cancelled" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleUpdateStatus(application.id, "cancelled")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              <span>Отменить</span>
                            </DropdownMenuItem>
                          )}
                          {application.status !== "active" &&
                            application.status !== "pending" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(application.id, "active")
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Активировать</span>
                              </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    <p className="text-muted-foreground">Заявки отсутствуют</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
