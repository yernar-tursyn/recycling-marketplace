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
  getAllUsers,
  updateUserStatus,
  updateUserRole,
} from "@/services/user-service";
import { addAdminLog } from "@/services/admin-service";
import { useToast } from "@/components/ui/use-toast";
import {
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

type UserWithoutPassword = Omit<import("@/types/user").UserType, "password"> & {
  password?: string;
};

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить список пользователей",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus(userId, newStatus);

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );

      if (user) {
        await addAdminLog({
          userId: user.id,
          userName: user.name,
          action: "update_user_status",
          details: `Изменен статус пользователя ${userId} на ${newStatus}`,
          ip: "127.0.0.1",
        });
      }

      toast({
        title: "Статус обновлен",
        description: `Статус пользователя успешно изменен на "${
          newStatus === "active" ? "Активен" : "Заблокирован"
        }"`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить статус пользователя",
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (user?.role !== "admin") {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description: "Только администраторы могут изменять роли пользователей",
      });
      return;
    }

    try {
      await updateUserRole(userId, newRole);

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );

      if (user) {
        await addAdminLog({
          userId: user.id,
          userName: user.name,
          action: "update_user_role",
          details: `Изменена роль пользователя ${userId} на ${newRole}`,
          ip: "127.0.0.1",
        });
      }

      toast({
        title: "Роль обновлена",
        description: `Роль пользователя успешно изменена на "${
          newRole === "admin"
            ? "Администратор"
            : newRole === "manager"
            ? "Менеджер"
            : "Пользователь"
        }"`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить роль пользователя",
      });
    }
  };

  const getRoleLabel = (role: string | undefined) => {
    switch (role) {
      case "admin":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <ShieldAlert className="h-3 w-3" /> Администратор
          </Badge>
        );
      case "manager":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Менеджер
          </Badge>
        );
      default:
        return <Badge variant="outline">Пользователь</Badge>;
    }
  };

  const getTypeLabel = (type: string | undefined) => {
    switch (type) {
      case "staff":
        return <Badge variant="secondary">Персонал</Badge>;
      case "seller":
        return <Badge variant="outline">Продавец</Badge>;
      case "buyer":
        return <Badge variant="outline">Покупатель</Badge>;
      default:
        return <Badge variant="outline">{type || "Не указан"}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Загрузка пользователей...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Управление пользователями</h1>
        <Badge variant="outline">{users.length} пользователей</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>
            Управление пользователями платформы.{" "}
            {user?.role === "admin"
              ? "Как администратор, вы можете изменять роли и статусы пользователей."
              : "Как менеджер, вы можете изменять статусы пользователей."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getTypeLabel(user.type)}</TableCell>
                  <TableCell>{getRoleLabel(user.role)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "success" : "destructive"
                      }
                      className={
                        user.status === "active"
                          ? "bg-green-500 hover:bg-green-600"
                          : ""
                      }
                    >
                      {user.status === "active" ? "Активен" : "Заблокирован"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Не указана"}
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
                        {user.status === "active" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(user.id, "blocked")
                            }
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            <span>Заблокировать</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(user.id, "active")
                            }
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Активировать</span>
                          </DropdownMenuItem>
                        )}

                        {user.role !== "admin" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Изменить роль</DropdownMenuLabel>
                            {user.role !== "manager" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(user.id, "manager")
                                }
                                disabled={
                                  user.role === "admin" ||
                                  user.role === "manager"
                                }
                              >
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Сделать менеджером</span>
                              </DropdownMenuItem>
                            )}
                            {user.role !== "user" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateRole(user.id, "user")
                                }
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>Сделать обычным пользователем</span>
                              </DropdownMenuItem>
                            )}
                          </>
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
