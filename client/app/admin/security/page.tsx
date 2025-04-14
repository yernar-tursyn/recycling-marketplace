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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { addAdminLog, getAdminLogsHistory } from "@/services/admin-service";
import {
  AlertTriangle,
  Clock,
  Download,
  Lock,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";

export default function SecurityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);

  const [securityEvents] = useState([
    {
      id: "1",
      type: "login_failed",
      user: "unknown@example.com",
      ip: "192.168.1.1",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: "Неудачная попытка входа",
      severity: "medium",
    },
    {
      id: "2",
      type: "permission_change",
      user: "admin@ecomarket.ru",
      ip: "127.0.0.1",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: "Изменены права пользователя manager@ecomarket.ru",
      severity: "high",
    },
    {
      id: "3",
      type: "login_success",
      user: "manager@ecomarket.ru",
      ip: "192.168.1.100",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: "Успешный вход в систему",
      severity: "low",
    },
  ]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        variant: "destructive",
        title: "Доступ запрещен",
        description:
          "Только администраторы имеют доступ к странице безопасности",
      });
      return;
    }

    const fetchLogs = async () => {
      try {
        const logsData = await getAdminLogsHistory(20);
        setLogs(logsData);
      } catch (error) {
        console.error("Error fetching logs:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить журнал действий",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [user, toast]);

  const handleRefreshLogs = async () => {
    setIsLoading(true);
    try {
      const logsData = await getAdminLogsHistory(20);
      setLogs(logsData);

      toast({
        title: "Журнал обновлен",
        description: "Журнал действий успешно обновлен",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить журнал действий",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportLogs = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (user) {
        await addAdminLog({
          userId: user.id,
          userName: user.name,
          action: "export_logs",
          details: "Экспорт журнала действий",
          ip: "127.0.0.1",
        });
      }

      toast({
        title: "Журнал экспортирован",
        description: "Журнал действий успешно экспортирован",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось экспортировать журнал действий",
      });
    }
  };

  if (user && user.role !== "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Безопасность</h1>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-200">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <p className="font-medium">Доступ запрещен</p>
          </div>
          <p className="mt-2">
            Только администраторы имеют доступ к странице безопасности.
            Обратитесь к администратору, если вам требуется доступ к этой
            странице.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Безопасность</h1>
      </div>

      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">Журнал действий</TabsTrigger>
          <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
          <TabsTrigger value="access">Контроль доступа</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Журнал действий администраторов</CardTitle>
                <CardDescription>
                  История действий администраторов и менеджеров в системе
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshLogs}
                  disabled={isLoading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Обновить
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportLogs}>
                  <Download className="mr-2 h-4 w-4" />
                  Экспорт
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действие</TableHead>
                    <TableHead>Детали</TableHead>
                    <TableHead>IP-адрес</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Загрузка журнала...
                      </TableCell>
                    </TableRow>
                  ) : logs.length > 0 ? (
                    logs.map((log) => (
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
                        <TableCell>{log.ip}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Нет записей в журнале
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Мониторинг безопасности</CardTitle>
              <CardDescription>События безопасности в системе</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Время</TableHead>
                    <TableHead>Тип события</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>IP-адрес</TableHead>
                    <TableHead>Детали</TableHead>
                    <TableHead>Важность</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        {new Date(event.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{event.type}</TableCell>
                      <TableCell>{event.user}</TableCell>
                      <TableCell>{event.ip}</TableCell>
                      <TableCell>{event.details}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            event.severity === "high"
                              ? "destructive"
                              : event.severity === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {event.severity === "high"
                            ? "Высокая"
                            : event.severity === "medium"
                            ? "Средняя"
                            : "Низкая"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Контроль доступа</CardTitle>
              <CardDescription>
                Настройки безопасности и контроля доступа
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        Двухфакторная аутентификация
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Обязательна для всех администраторов и менеджеров
                      </p>
                    </div>
                  </div>
                  <Badge>Включена</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Блокировка по IP</p>
                      <p className="text-sm text-muted-foreground">
                        Блокировка после 5 неудачных попыток входа
                      </p>
                    </div>
                  </div>
                  <Badge>Включена</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Сложность паролей</p>
                      <p className="text-sm text-muted-foreground">
                        Минимум 8 символов, буквы, цифры и спецсимволы
                      </p>
                    </div>
                  </div>
                  <Badge>Включена</Badge>
                </div>
              </div>

              <Button className="w-full">
                Настроить политики безопасности
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
