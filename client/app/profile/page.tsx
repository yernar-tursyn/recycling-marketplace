"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { CalendarDays, FileText, MapPin, Package, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type UserType = {
  id: string;
  name: string;
  email: string;
  type: "buyer" | "seller" | "staff";
  role?: "admin" | "manager";
  avatar?: string;
  location?: string;
  createdAt: string;
};

type ApplicationType = {
  id: string;
  title: string;
  description: string;
  materialType: string;
  quantity: number;
  price: number;
  status: "active" | "completed" | "pending";
  createdAt: string;
};

type MaterialType = {
  id: string;
  name: string;
  type: string;
  price: number;
  quantity: number;
  status: "active" | "pending" | "rejected";
  image: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем данные пользователя
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Не авторизован");
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Получаем заявки пользователя
        const appsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/applications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          setApplications(appsData);
        }

        // Если продавец - получаем его материалы
        if (userData.type === "seller") {
          const materialsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/materials/my`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          if (materialsResponse.ok) {
            const materialsData = await materialsResponse.json();
            setMaterials(materialsData);
          }
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        router.push("/auth/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-3/4 mt-4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-6 w-1/2 mt-2" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-3">
            <Skeleton className="h-10 w-full mb-4" />
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                {user.type === "staff"
                  ? user.role === "admin"
                    ? "Администратор"
                    : "Менеджер"
                  : user.type === "buyer"
                  ? "Покупатель"
                  : "Продавец"}
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

                {user.type === "buyer" ? (
                  <Button
                    variant="outline"
                    className="justify-start"
                    onClick={() => router.push("/profile/applications")}
                  >
                    Мои заявки на покупку
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => router.push("/profile/materials")}
                    >
                      Мои материалы
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => router.push("/profile/applications")}
                    >
                      Заявки на мои материалы
                    </Button>
                  </>
                )}

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
                <Button
                  variant="outline"
                  className="justify-start text-red-500 hover:text-red-600"
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Обзор</TabsTrigger>
              {user.type === "buyer" ? (
                <TabsTrigger value="applications">Мои заявки</TabsTrigger>
              ) : (
                <>
                  <TabsTrigger value="materials">Мои материалы</TabsTrigger>
                  <TabsTrigger value="applications">Заявки</TabsTrigger>
                </>
              )}
              <TabsTrigger value="stats">Статистика</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Добро пожаловать, {user.name}!</CardTitle>
                  <CardDescription>
                    Это ваш личный кабинет, где вы можете{" "}
                    {user.type === "buyer"
                      ? "искать и покупать материалы"
                      : "размещать материалы на продажу и управлять заявками"}
                    .
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.type === "buyer" ? (
                      <>
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
                              Завершенные покупки
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
                      </>
                    ) : (
                      <>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Активные материалы
                            </CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {
                                materials.filter(
                                  (mat) => mat.status === "active"
                                ).length
                              }
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                              Заявки на материалы
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
                      </>
                    )}
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

            {user.type === "seller" && (
              <TabsContent value="materials">
                <Card>
                  <CardHeader className="flex justify-between items-center">
                    <div>
                      <CardTitle>Мои материалы</CardTitle>
                      <CardDescription>
                        Управляйте своими материалами на продажу
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => router.push("/profile/materials/new")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Добавить материал
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {materials.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {materials.map((material) => (
                          <Card key={material.id} className="overflow-hidden">
                            <div
                              className="h-40 bg-muted bg-cover bg-center"
                              style={{
                                backgroundImage: `url(${material.image})`,
                              }}
                            />
                            <CardHeader className="p-4">
                              <div className="flex justify-between">
                                <CardTitle className="text-lg">
                                  {material.name}
                                </CardTitle>
                                <Badge
                                  variant={
                                    material.status === "active"
                                      ? "default"
                                      : material.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {material.status === "active"
                                    ? "Активен"
                                    : material.status === "pending"
                                    ? "На проверке"
                                    : "Отклонен"}
                                </Badge>
                              </div>
                              <CardDescription>{material.type}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              <div className="flex justify-between items-center">
                                <span className="font-bold">
                                  {material.price} ₽/кг
                                </span>
                                <span>Количество: {material.quantity} кг</span>
                              </div>
                            </CardContent>
                            <div className="p-4 border-t flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/profile/materials/edit/${material.id}`
                                  )
                                }
                              >
                                Редактировать
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() =>
                                  router.push(`/marketplace/${material.id}`)
                                }
                              >
                                Просмотр
                              </Button>
                            </div>
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
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="applications">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user.type === "buyer"
                      ? "Ваши заявки на покупку"
                      : "Заявки на ваши материалы"}
                  </CardTitle>
                  <CardDescription>
                    {user.type === "buyer"
                      ? "Управляйте своими заявками на покупку вторсырья"
                      : "Просмотрите заявки от покупателей на ваши материалы"}
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
                                  {application.price} ₽/кг
                                </span>
                              </div>
                            </div>
                          </CardContent>
                          {user.type === "seller" &&
                            application.status === "active" && (
                              <div className="p-4 border-t flex justify-end space-x-2">
                                <Button variant="outline" size="sm">
                                  Отклонить
                                </Button>
                                <Button variant="default" size="sm">
                                  Принять
                                </Button>
                              </div>
                            )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">
                        {user.type === "buyer"
                          ? "У вас пока нет заявок"
                          : "На ваши материалы пока нет заявок"}
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
