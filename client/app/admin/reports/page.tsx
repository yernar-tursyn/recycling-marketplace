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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getAllUsers } from "@/services/user-service";
import { getAllMaterials } from "@/services/material-service";
import { getAllApplications } from "@/services/application-service";
import { addAdminLog } from "@/services/admin-service";
import { useToast } from "@/components/ui/use-toast";
import { BarChart3, Download, FileText, Package, Users } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [usersCount, setUsersCount] = useState(0);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("users");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, materials, applications] = await Promise.all([
          getAllUsers(),
          getAllMaterials(),
          getAllApplications(),
        ]);

        setUsersCount(users.length);
        setMaterialsCount(materials.length);
        setApplicationsCount(applications.length);

        // Логируем действие
        if (user) {
          await addAdminLog({
            userId: user.id,
            userName: user.name,
            action: "view_reports",
            details: "Просмотр отчетов",
            ip: "127.0.0.1",
          });
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось загрузить данные для отчетов",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast, user]);

  const handleGenerateReport = async (type: string) => {

    toast({
      title: "Отчет сгенерирован",
      description: `Отчет по ${
        type === "users"
          ? "пользователям"
          : type === "materials"
          ? "материалам"
          : "заявкам"
      } успешно сгенерирован и готов к скачиванию`,
    });

    // Логируем действие
    if (user) {
      await addAdminLog({
        userId: user.id,
        userName: user.name,
        action: "generate_report",
        details: `Сгенерирован отчет по ${
          type === "users"
            ? "пользователям"
            : type === "materials"
            ? "материалам"
            : "заявкам"
        }`,
        ip: "127.0.0.1",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Загрузка данных для отчетов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Отчеты</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount}</div>
            <p className="text-xs text-muted-foreground">
              Всего пользователей в системе
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
              Всего материалов в системе
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
            <p className="text-xs text-muted-foreground">
              Всего заявок в системе
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Генерация отчетов</CardTitle>
          <CardDescription>
            Выберите тип отчета для генерации.{" "}
            {user?.role === "admin"
              ? "Как администратор, вы имеете доступ ко всем типам отчетов."
              : "Как менеджер, вы имеете ограниченный доступ к отчетам."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={reportType} onValueChange={setReportType}>
            <TabsList className="mb-4">
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="materials">Материалы</TabsTrigger>
              <TabsTrigger value="applications">Заявки</TabsTrigger>
              {user?.role === "admin" && (
                <TabsTrigger value="financial">Финансы</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Отчет по пользователям</h3>
                <p className="text-muted-foreground">
                  Отчет содержит информацию о всех пользователях системы, их
                  активности и статусах.
                </p>
                <Button
                  onClick={() => handleGenerateReport("users")}
                  className="mt-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Сгенерировать отчет
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Отчет по материалам</h3>
                <p className="text-muted-foreground">
                  Отчет содержит информацию о всех материалах в системе, их
                  типах, количестве и статусах.
                </p>
                <Button
                  onClick={() => handleGenerateReport("materials")}
                  className="mt-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Сгенерировать отчет
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Отчет по заявкам</h3>
                <p className="text-muted-foreground">
                  Отчет содержит информацию о всех заявках в системе, их
                  статусах и деталях.
                </p>
                <Button
                  onClick={() => handleGenerateReport("applications")}
                  className="mt-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Сгенерировать отчет
                </Button>
              </div>
            </TabsContent>

            {user?.role === "admin" && (
              <TabsContent value="financial" className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Финансовый отчет</h3>
                  <p className="text-muted-foreground">
                    Отчет содержит финансовую информацию о транзакциях и
                    оборотах на платформе. Доступен только для администраторов.
                  </p>
                  <Button
                    onClick={() => handleGenerateReport("financial")}
                    className="mt-2"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Сгенерировать отчет
                  </Button>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Визуализация данных</CardTitle>
          <CardDescription>
            Графическое представление ключевых показателей платформы.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Визуализация данных будет доступна в следующем обновлении.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
