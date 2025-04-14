"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { getAllUsers } from "@/services/user-service";
import { getAllMaterials } from "@/services/material-service";
import { getAllApplications } from "@/services/application-service";
import {
  getAdminLogsHistory,
  type AdminLogEntry,
} from "@/services/admin-service";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ShieldAlert, Users, Package, FileText, Clock } from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [usersCount, setUsersCount] = useState(0);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<AdminLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, materials, applications, logs] = await Promise.all([
          getAllUsers(),
          getAllMaterials(),
          getAllApplications(),
          getAdminLogsHistory(10),
        ]);

        setUsersCount(users.length);
        setMaterialsCount(materials.length);
        setApplicationsCount(applications.length);
        setRecentLogs(logs);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <Badge variant={user?.role === "admin" ? "destructive" : "default"}>
          {user?.role === "admin" ? "Администратор" : "Менеджер"}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
            <p className="text-xs text-muted-foreground">
              Зарегистрированных пользователей
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Материалы</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialsCount}</div>
            <p className="text-xs text-muted-foreground">
              Опубликованных материалов
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Заявки</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applicationsCount}</div>
            <p className="text-xs text-muted-foreground">Активных заявок</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Безопасность</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Активна</div>
            <p className="text-xs text-muted-foreground">Система мониторинга</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity">
        <TabsList>
          <TabsTrigger value="activity">Активность</TabsTrigger>
          <TabsTrigger value="security">Безопасность</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Последние действия</CardTitle>
              <CardDescription>
                История действий администраторов и менеджеров
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.length > 0 ? (
                    recentLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.action === "login" ? "default" : "secondary"
                            }
                          >
                            {log.action === "login"
                              ? "Вход"
                              : log.action === "logout"
                              ? "Выход"
                              : log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Нет записей
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Настройки безопасности</CardTitle>
              <CardDescription>
                Управление параметрами безопасности системы
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      Двухфакторная аутентификация
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Обязательна для всех администраторов и менеджеров
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Badge>Включена</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Время сессии</h3>
                    <p className="text-sm text-muted-foreground">
                      Автоматический выход после периода неактивности
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Badge>30 минут</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Журналирование</h3>
                    <p className="text-sm text-muted-foreground">
                      Запись всех действий администраторов и менеджеров
                    </p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Badge>Включено</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
