"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserApplications } from "@/services/application-service";
import type { ApplicationType } from "@/types/application";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, FileText, MapPin, Package } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const fetchApplications = async () => {
      const data = await getUserApplications(user.id);
      setApplications(data);
    };

    fetchApplications();
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-10">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <Badge className="mt-2">
                {user.type === "buyer" ? "Покупатель" : "Продавец"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => router.push("/profile/edit")}
                >
                  Редактировать профиль
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => router.push("/profile/applications")}
                >
                  Мои заявки
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => router.push("/profile/favorites")}
                >
                  Избранное
                </Button>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => router.push("/profile/settings")}
                >
                  Настройки
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              <TabsTrigger value="applications">Заявки</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Добро пожаловать, {user.name}!</CardTitle>
                  <CardDescription>
                    Это ваш личный кабинет, где вы можете управлять своими
                    заявками и настройками.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Активные заявки
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            applications.filter(
                              (app) => app.status === "active"
                            ).length
                          }
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Завершенные сделки
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {
                            applications.filter(
                              (app) => app.status === "completed"
                            ).length
                          }
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Дата регистрации
                        </CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Местоположение
                        </CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          {user.location || "Не указано"}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>Ваши заявки</CardTitle>
                  <CardDescription>
                    Управляйте своими заявками на покупку или продажу вторсырья
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <Card key={application.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-lg">
                                {application.title}
                              </CardTitle>
                              <Badge
                                variant={
                                  application.status === "active"
                                    ? "default"
                                    : application.status === "completed"
                                    ? "secondary"
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
                                  : "В обработке"}
                              </Badge>
                            </div>
                            <CardDescription>
                              Создана:{" "}
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{application.description}</p>
                            <div className="flex justify-between items-center mt-4">
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
                                  {application.price} ₸/кг
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        У вас пока нет заявок
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => router.push("/marketplace")}
                      >
                        Перейти на витрину
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Статистика</CardTitle>
                  <CardDescription>
                    Ваша активность на платформе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-10">
                    <p className="text-muted-foreground">
                      Статистика будет доступна после совершения сделок
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
