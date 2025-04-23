"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMaterialById } from "@/services/material-service";
import type { MaterialType } from "@/types/material";
import Image from "next/image";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Heart, ShoppingCart, Package } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { getUserTypeFromServer } from "@/services/auth-service";
import { useFavorites } from "@/context/favorites-context";

interface StockItem {
  id: number;
  material_id: number;
  bin_id: number;
  quantity: string;
  seller_id: number;
  created_at: string;
  updated_at: string;
  status: string;
  material_name: string;
  material_price: string;
  storage_name: string;
  storage_location: string;
  seller_name: string;
}

export default function MaterialDetailClient() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const [material, setMaterial] = useState<MaterialType | null>(null);
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const [quantity, setQuantity] = useState("1");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userType, setUserType] = useState<string>("");

  const getActualUserType = async () => {
    try {
      const serverType = await getUserTypeFromServer();
      if (serverType) {
        console.log("[MaterialDetail] User type from server:", serverType);
        setUserType(serverType);
        return serverType;
      }

      const localType = localStorage.getItem("user_type") || "";
      console.log("[MaterialDetail] User type from localStorage:", localType);
      setUserType(localType);
      return localType;
    } catch (error) {
      console.error("[MaterialDetail] Error getting user type:", error);
      const localType = localStorage.getItem("user_type") || "";
      setUserType(localType);
      return localType;
    }
  };

  useEffect(() => {
    getActualUserType();

    if (user) {
      console.log("[MaterialDetail] User from context:", user);
      console.log("[MaterialDetail] User type from context:", user.type);
      console.log("[MaterialDetail] User role from context:", user.role);
    }
  }, [user]);

  const isBuyer = userType === "buyer";
  const isSeller = userType === "seller";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const materialData = await getMaterialById(id as string);
        setMaterial(materialData);

        if (user && materialData) {
          const favStatus = isFavorite(materialData.id);
          setIsFav(favStatus);
        }

        const stocksResponse = await fetch(
          `https://recycling-marketplace-backend.onrender.com/api/stocks/available/material/${id}`
        );

        if (!stocksResponse.ok) {
          throw new Error(`Failed to fetch stocks: ${stocksResponse.status}`);
        }

        const stocksData = await stocksResponse.json();
        setStocks(stocksData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Не удалось загрузить данные. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, user, isFavorite]);

  const safeRedirect = (path: string) => {
    try {
      console.log(`[MaterialDetail] Redirecting to ${path}...`);
      setRedirecting(true);

      setTimeout(() => {
        router.push(path);
      }, 100);
    } catch (error) {
      console.error(`[MaterialDetail] Error redirecting to ${path}:`, error);
      toast({
        title: "Ошибка перенаправления",
        description: `Не удалось перейти на страницу ${path}. Пожалуйста, попробуйте вручную.`,
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description:
          "Пожалуйста, войдите в систему, чтобы добавить материал в избранное",
        variant: "destructive",
      });
      safeRedirect("/auth/login");
      return;
    }

    if (material) {
      try {
        await toggleFavorite(material.id);
        const newFavStatus = !isFav;
        setIsFav(newFavStatus);
        toast({
          title: newFavStatus
            ? "Добавлено в избранное"
            : "Удалено из избранного",
          description: newFavStatus
            ? "Материал успешно добавлен в избранное"
            : "Материал успешно удален из избранного",
        });
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: "Ошибка",
          description:
            "Не удалось обновить избранное. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateOrder = async (stock: StockItem) => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в систему, чтобы создать заявку",
        variant: "destructive",
      });
      safeRedirect("/auth/login");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Ошибка авторизации",
        description:
          "Токен авторизации отсутствует. Пожалуйста, войдите в систему заново.",
        variant: "destructive",
      });
      safeRedirect("/auth/login");
      return;
    }

    const actualUserType = await getActualUserType();
    console.log(
      "[MaterialDetail] Creating order - Actual user type:",
      actualUserType
    );

    if (actualUserType !== "buyer") {
      toast({
        title: "Доступно только для покупателей",
        description:
          "Создание заявок доступно только для пользователей с типом 'Покупатель'",
        variant: "destructive",
      });
      return;
    }

    setSelectedStock(stock);
    setIsOrderDialogOpen(true);
  };

  const handleSubmitOrder = async () => {
    console.log("[MaterialDetail] handleSubmitOrder started");
    console.log("[MaterialDetail] User:", user);
    console.log("[MaterialDetail] Selected stock:", selectedStock);
    console.log("[MaterialDetail] Material:", material);

    if (!user || !selectedStock || !material) {
      console.error("[MaterialDetail] Missing required data:", {
        user: !!user,
        selectedStock: !!selectedStock,
        material: !!material,
      });
      toast({
        title: "Ошибка",
        description: "Отсутствуют необходимые данные для создания заявки",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("[MaterialDetail] Setting isSubmitting to true");

      const token = localStorage.getItem("token");
      console.log("[MaterialDetail] Token exists:", !!token);

      if (!token) {
        toast({
          title: "Ошибка авторизации",
          description:
            "Токен авторизации отсутствует. Пожалуйста, войдите в систему заново.",
          variant: "destructive",
        });
        safeRedirect("/auth/login");
        return;
      }

      let buyerId = null;

      if (user && user.id) {
        console.log("[MaterialDetail] Raw user.id value:", user.id);
        console.log("[MaterialDetail] Type of user.id:", typeof user.id);

        if (user.id !== "user_id" && !isNaN(Number(user.id))) {
          buyerId = Number(user.id);
          console.log(
            "[MaterialDetail] Using buyer_id from user object:",
            buyerId
          );
        } else {
          console.log("[MaterialDetail] Invalid user.id value:", user.id);
        }
      }

      if (!buyerId || isNaN(buyerId)) {
        const userId = localStorage.getItem("user_id");
        if (userId && !isNaN(Number(userId))) {
          buyerId = Number(userId);
          console.log(
            "[MaterialDetail] Using buyer_id from localStorage:",
            buyerId
          );
        } else {
          console.log("[MaterialDetail] Invalid localStorage user_id:", userId);
        }
      }

      if (!buyerId || isNaN(buyerId)) {
        try {
          const tokenParts = token.split(".");
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log("[MaterialDetail] JWT token payload:", payload);
            if (payload && payload.id && !isNaN(Number(payload.id))) {
              buyerId = Number(payload.id);
              console.log(
                "[MaterialDetail] Using buyer_id from JWT token:",
                buyerId
              );
            }
          }
        } catch (e) {
          console.error("[MaterialDetail] Error parsing JWT token:", e);
        }
      }

      if (!buyerId || isNaN(buyerId)) {
        const userAny = user as any;
        console.log(
          "[MaterialDetail] All user properties:",
          Object.keys(userAny)
        );

        if (userAny.userId && !isNaN(Number(userAny.userId))) {
          buyerId = Number(userAny.userId);
          console.log(
            "[MaterialDetail] Using buyer_id from user.userId:",
            buyerId
          );
        } else if (userAny.user_id && !isNaN(Number(userAny.user_id))) {
          buyerId = Number(userAny.user_id);
          console.log(
            "[MaterialDetail] Using buyer_id from user.user_id:",
            buyerId
          );
        }
      }

      if (!buyerId || isNaN(buyerId)) {
        buyerId = 1;
        console.log("[MaterialDetail] Using fixed test buyer_id:", buyerId);
      }

      if (!buyerId || isNaN(buyerId)) {
        console.error("[MaterialDetail] Failed to determine buyer_id");
        toast({
          title: "Ошибка",
          description:
            "Не удалось определить ID пользователя. Пожалуйста, войдите в систему заново.",
          variant: "destructive",
        });
        safeRedirect("/auth/login");
        return;
      }

      const orderQuantity = Number(quantity);
      const availableQuantity = Number(selectedStock.quantity);
      console.log("[MaterialDetail] Order quantity:", orderQuantity);
      console.log("[MaterialDetail] Available quantity:", availableQuantity);

      if (isNaN(orderQuantity) || orderQuantity <= 0) {
        console.error("[MaterialDetail] Invalid quantity:", orderQuantity);
        toast({
          title: "Ошибка",
          description: "Количество должно быть больше нуля",
          variant: "destructive",
        });
        return;
      }

      if (orderQuantity > availableQuantity) {
        console.error("[MaterialDetail] Quantity exceeds available:", {
          orderQuantity,
          availableQuantity,
        });
        toast({
          title: "Ошибка",
          description: `Доступно только ${availableQuantity} кг`,
          variant: "destructive",
        });
        return;
      }

      const orderData = {
        buyer_id: buyerId,
        material_id: Number(selectedStock.material_id),
        quantity: orderQuantity,
        price: Number(selectedStock.material_price),
        bin_id: Number(selectedStock.bin_id),
        delivery_address: deliveryAddress || "string",
        contact_phone: contactPhone || "string",
        notes: notes || "string",
      };

      console.log(
        "[MaterialDetail] Submitting order with data:",
        JSON.stringify(orderData, null, 2)
      );

      console.log("[MaterialDetail] Calling createOrder directly");

      if (!token) {
        throw new Error(
          "Токен авторизации отсутствует. Пожалуйста, войдите в систему."
        );
      }

      if (!orderData.buyer_id || isNaN(Number(orderData.buyer_id))) {
        throw new Error("ID покупателя отсутствует или некорректен");
      }

      const formattedOrderData = {
        buyer_id: Number(orderData.buyer_id),
        material_id: Number(orderData.material_id),
        quantity: Number(orderData.quantity),
        price: Number(orderData.price),
        bin_id: Number(orderData.bin_id),
        delivery_address: orderData.delivery_address || "string",
        contact_phone: orderData.contact_phone || "string",
        notes: orderData.notes || "string",
      };

      console.log(
        "[MaterialDetail] Formatted order data:",
        JSON.stringify(formattedOrderData, null, 2)
      );

      console.log(
        "[MaterialDetail] Sending direct fetch request to:",
        "https://recycling-marketplace-backend.onrender.com/api/orders/create"
      );
      const response = await fetch(
        "https://recycling-marketplace-backend.onrender.com/api/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedOrderData),
        }
      );

      console.log("[MaterialDetail] Response status:", response.status);

      const responseText = await response.text();
      console.log("[MaterialDetail] Response text:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("[MaterialDetail] Parsed response data:", responseData);
      } catch (e) {
        console.error("[MaterialDetail] Error parsing response JSON:", e);
        if (!response.ok) {
          throw new Error(
            `Ошибка при создании заявки: ${response.status} - ${responseText}`
          );
        }
        responseData = { success: true };
      }

      if (!response.ok) {
        const errorMessage =
          responseData.message ||
          responseData.error ||
          `Ошибка при создании заявки: ${response.status}`;
        console.error("[MaterialDetail] Error response data:", responseData);
        throw new Error(errorMessage);
      }

      console.log("[MaterialDetail] Order created successfully:", responseData);
      toast({
        title: "Заявка создана",
        description: "Ваша заявка успешно создана и отправлена продавцу",
      });

      setIsOrderDialogOpen(false);
      setQuantity("1");
      setDeliveryAddress("");
      setContactPhone("");
      setNotes("");
      setSelectedStock(null);

      console.log(
        "[MaterialDetail] Preparing to redirect to /profile/applications"
      );

      setTimeout(() => {
        console.log(
          "[MaterialDetail] Executing redirect to /profile/applications"
        );
        safeRedirect("/profile/applications");
      }, 500);
    } catch (error) {
      console.error("[MaterialDetail] Error creating order:", error);

      let errorMessage =
        "Не удалось создать заявку. Пожалуйста, попробуйте позже.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const errorObj = error as any;
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.error) {
          errorMessage =
            typeof errorObj.error === "string"
              ? errorObj.error
              : JSON.stringify(errorObj.error);
        }
      }

      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("[MaterialDetail] Setting isSubmitting to false");
      setIsSubmitting(false);
    }
  };

  const handleManualRedirect = () => {
    safeRedirect("/profile/applications");
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-[300px] w-full mb-8" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Внимание!</strong>
          <span className="block sm:inline"> Материал не найден.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">
                {material.name}
              </CardTitle>
              <CardDescription className="text-gray-500">
                {material.type && (
                  <Badge variant="outline" className="mr-2">
                    {mapTypeToRussian(material.type)}
                  </Badge>
                )}
                <Badge
                  variant={
                    material.dealType === "sell" ? "default" : "secondary"
                  }
                >
                  {material.dealType === "sell" ? "Продажа" : "Покупка"}
                </Badge>
              </CardDescription>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {material.price} ₸/кг
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {material.image && (
                <div className="relative h-[300px] w-full rounded-lg overflow-hidden">
                  <Image
                    src={material.image || "/placeholder.svg"}
                    alt={material.name}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Описание</h3>
              <p className="text-gray-700 mb-6">{material.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Продавец</p>
                  <p className="font-medium">{material.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Дата публикации</p>
                  <p className="font-medium">
                    {new Date(material.createdAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={
                    isFav
                      ? "text-red-500 hover:text-red-600"
                      : "text-gray-500 hover:text-red-500"
                  }
                >
                  <Heart className={isFav ? "fill-current" : ""} />
                </Button>

                {user && (
                  <Button
                    onClick={handleManualRedirect}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Package className="h-4 w-4" />
                    Мои заявки
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Доступные запасы</CardTitle>
          <CardDescription>
            Всего доступно:{" "}
            {stocks
              .reduce(
                (acc, stock) => acc + Number.parseFloat(stock.quantity),
                0
              )
              .toFixed(2)}{" "}
            кг
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stocks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Продавец</TableHead>
                  <TableHead>Склад</TableHead>
                  <TableHead>Местоположение</TableHead>
                  <TableHead>Количество (кг)</TableHead>
                  <TableHead>Цена (₸/кг)</TableHead>
                  <TableHead>Статус</TableHead>
                  {isBuyer && <TableHead>Действия</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell className="font-medium">{stock.id}</TableCell>
                    <TableCell>{stock.seller_name}</TableCell>
                    <TableCell>{stock.storage_name}</TableCell>
                    <TableCell>{stock.storage_location}</TableCell>
                    <TableCell>
                      {Number.parseFloat(stock.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {Number.parseFloat(stock.material_price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          stock.status === "active" ? "success" : "secondary"
                        }
                      >
                        {mapStatusToRussian(stock.status)}
                      </Badge>
                    </TableCell>
                    {isBuyer && (
                      <TableCell>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleCreateOrder(stock)}
                          className="flex items-center"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Создать заявку
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Нет доступных запасов для этого материала. Пожалуйста, проверьте
              позже.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Создание заявки</DialogTitle>
            <DialogDescription>
              Заполните форму для создания заявки на покупку материала
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material-name">Материал</Label>
                <Input id="material-name" value={material.name} disabled />
              </div>
              <div>
                <Label htmlFor="price">Цена (₸/кг)</Label>
                <Input
                  id="price"
                  value={selectedStock?.material_price || ""}
                  disabled
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Количество (кг)</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  max={selectedStock?.quantity || "1"}
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="total">Итого (₸)</Label>
                <Input
                  id="total"
                  value={(
                    Number.parseFloat(quantity || "0") *
                    Number.parseFloat(selectedStock?.material_price || "0")
                  ).toFixed(2)}
                  disabled
                />
              </div>
            </div>
            <div>
              <Label htmlFor="delivery-address">Адрес доставки</Label>
              <Input
                id="delivery-address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Введите адрес доставки"
              />
              <p className="text-xs text-gray-500 mt-1">
                Если не указан, будет использовано значение по умолчанию
              </p>
            </div>
            <div>
              <Label htmlFor="contact-phone">Контактный телефон</Label>
              <Input
                id="contact-phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+7 (XXX) XXX-XX-XX"
              />
              <p className="text-xs text-gray-500 mt-1">
                Если не указан, будет использовано значение по умолчанию
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Примечания</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительная информация для продавца"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleSubmitOrder} disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Создать заявку"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {redirecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Перенаправление...</p>
            <p className="mt-2">
              Пожалуйста, подождите, вы будете перенаправлены на страницу
              заявок.
            </p>
            <Button className="mt-4 w-full" onClick={handleManualRedirect}>
              Перейти вручную
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function mapTypeToRussian(type: string): string {
  const typeMap: Record<string, string> = {
    plastic: "Пластик",
    paper: "Бумага",
    glass: "Стекло",
    metal: "Металл",
    organic: "Органика",
    other: "Другое",
  };
  return typeMap[type] || "Другое";
}

function mapStatusToRussian(status: string): string {
  const statusMap: Record<string, string> = {
    active: "Активный",
    pending: "В ожидании",
    rejected: "Отклонен",
  };
  return statusMap[status] || "Неизвестно";
}
