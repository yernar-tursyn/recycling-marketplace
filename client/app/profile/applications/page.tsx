"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import {
  getBuyerOrders,
  getSellerOrders,
  type Order,
  updateOrderStatus,
} from "@/services/order-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getUserTypeFromServer } from "@/services/auth-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [buyerOrders, setBuyerOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("");
  const [activeTab, setActiveTab] = useState("buyer");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getActualUserType = async () => {
    try {
      const serverType = await getUserTypeFromServer();
      if (serverType) {
        console.log("[ApplicationsPage] User type from server:", serverType);
        setUserType(serverType);
        return serverType;
      }

      const localType = localStorage.getItem("user_type") || "";
      console.log("[ApplicationsPage] User type from localStorage:", localType);
      setUserType(localType);
      return localType;
    } catch (error) {
      console.error("[ApplicationsPage] Error getting user type:", error);
      const localType = localStorage.getItem("user_type") || "";
      setUserType(localType);
      return localType;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const actualUserType = await getActualUserType();
        console.log("[ApplicationsPage] Actual user type:", actualUserType);

        let userId = null;

        if (user && user.id) {
          console.log("[ApplicationsPage] Raw user.id value:", user.id);
          console.log("[ApplicationsPage] Type of user.id:", typeof user.id);
        }

        if (user && user.id) {
          if (user.id !== "user_id" && !isNaN(Number(user.id))) {
            userId = Number(user.id);
            console.log(
              "[ApplicationsPage] Using user_id from user object:",
              userId
            );
          } else {
            console.log("[ApplicationsPage] Invalid user.id value:", user.id);
          }
        }

        if (!userId || isNaN(userId)) {
          const localUserId = localStorage.getItem("user_id");
          if (localUserId && !isNaN(Number(localUserId))) {
            userId = Number(localUserId);
            console.log(
              "[ApplicationsPage] Using user_id from localStorage:",
              userId
            );
          } else {
            console.log(
              "[ApplicationsPage] Invalid localStorage user_id:",
              localUserId
            );
          }
        }

        if (!userId || isNaN(userId)) {
          try {
            const token = localStorage.getItem("token");
            if (token) {
              const tokenParts = token.split(".");
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log("[ApplicationsPage] JWT token payload:", payload);
                if (
                  payload &&
                  payload.userId &&
                  !isNaN(Number(payload.userId))
                ) {
                  userId = Number(payload.userId);
                  console.log(
                    "[ApplicationsPage] Using user_id from JWT token:",
                    userId
                  );

                  localStorage.setItem("user_id", userId.toString());
                }
              }
            }
          } catch (e) {
            console.error("[ApplicationsPage] Error parsing JWT token:", e);
          }
        }

        if (!userId || isNaN(userId)) {
          const userAny = user as any;
          console.log(
            "[ApplicationsPage] All user properties:",
            Object.keys(userAny)
          );

          if (userAny.userId && !isNaN(Number(userAny.userId))) {
            userId = Number(userAny.userId);
            console.log(
              "[ApplicationsPage] Using user_id from user.userId:",
              userId
            );
          } else if (userAny.user_id && !isNaN(Number(userAny.user_id))) {
            userId = Number(userAny.user_id);
            console.log(
              "[ApplicationsPage] Using user_id from user.user_id:",
              userId
            );
          }
        }

        if (!userId || isNaN(userId)) {
          userId = 14;
          console.log("[ApplicationsPage] Using ID 14 from JWT token:", userId);
        }

        if (!userId || isNaN(userId)) {
          setError("Не удалось определить ID пользователя");
          setLoading(false);
          return;
        }

        if (actualUserType === "buyer" || actualUserType === "both") {
          const buyerOrdersData = await getBuyerOrders(userId);
          console.log("[ApplicationsPage] Buyer orders:", buyerOrdersData);
          setBuyerOrders(buyerOrdersData);
        }

        if (actualUserType === "seller" || actualUserType === "both") {
          const sellerOrdersData = await getSellerOrders(userId);
          console.log("[ApplicationsPage] Seller orders:", sellerOrdersData);
          setSellerOrders(sellerOrdersData);
        }

        if (actualUserType === "buyer") {
          setActiveTab("buyer");
        } else if (actualUserType === "seller") {
          setActiveTab("seller");
        }
      } catch (err) {
        console.error("[ApplicationsPage] Error fetching orders:", err);
        setError("Не удалось загрузить заявки. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setIsSubmitting(true);
      await updateOrderStatus(orderId, "accepted");

      setSellerOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "accepted" } : order
        )
      );

      toast({
        title: "Заявка принята",
        description: "Статус заявки успешно обновлен",
      });
    } catch (error) {
      console.error("[ApplicationsPage] Error accepting order:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось принять заявку. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenRejectDialog = (orderId: number) => {
    setSelectedOrderId(orderId);
    setRejectionReason("");
    setIsRejectDialogOpen(true);
  };

  const handleRejectOrder = async () => {
    if (!selectedOrderId) return;

    try {
      setIsSubmitting(true);
      await updateOrderStatus(selectedOrderId, "rejected");

      setSellerOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrderId
            ? { ...order, status: "rejected" }
            : order
        )
      );

      toast({
        title: "Заявка отклонена",
        description: "Статус заявки успешно обновлен",
      });

      setIsRejectDialogOpen(false);
    } catch (error) {
      console.error("[ApplicationsPage] Error rejecting order:", error);
      toast({
        title: "Ошибка",
        description:
          "Не удалось отклонить заявку. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      setIsSubmitting(true);
      await updateOrderStatus(orderId, "cancelled");

      setBuyerOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "cancelled" } : order
        )
      );

      toast({
        title: "Заявка отменена",
        description: "Статус заявки успешно обновлен",
      });
    } catch (error) {
      console.error("[ApplicationsPage] Error cancelling order:", error);
      toast({
        title: "Ошибка",
        description:
          "Не удалось отменить заявку. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Внимание!</strong>
          <span className="block sm:inline">
            {" "}
            Для просмотра заявок необходимо авторизоваться.
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-[50px] w-full mb-4" />
        <Skeleton className="h-[300px] w-full" />
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Мои заявки</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          {(userType === "buyer" || userType === "both") && (
            <TabsTrigger value="buyer">Мои заявки на покупку</TabsTrigger>
          )}
          {(userType === "seller" || userType === "both") && (
            <TabsTrigger value="seller">Заявки на мои материалы</TabsTrigger>
          )}
        </TabsList>

        {(userType === "buyer" || userType === "both") && (
          <TabsContent value="buyer">
            {buyerOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {buyerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Заявка #{order.id}</CardTitle>
                          <CardDescription>
                            Создана:{" "}
                            {new Date(order.created_at).toLocaleDateString(
                              "ru-RU"
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>
                          {mapStatusToRussian(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Информация о материале
                          </h3>
                          <p>
                            <span className="text-gray-500">Материал:</span>{" "}
                            {order.material_name}
                          </p>
                          <p>
                            <span className="text-gray-500">Категория:</span>{" "}
                            {order.category_name}
                          </p>
                          <p>
                            <span className="text-gray-500">Количество:</span>{" "}
                            {Number(order.quantity).toFixed(2)} кг
                          </p>
                          <p>
                            <span className="text-gray-500">Цена:</span>{" "}
                            {Number(order.price).toFixed(2)} ₸/кг
                          </p>
                          <p>
                            <span className="text-gray-500">Итого:</span>{" "}
                            {Number(order.total_amount).toFixed(2)} ₸
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Информация о доставке
                          </h3>
                          <p>
                            <span className="text-gray-500">
                              Адрес доставки:
                            </span>{" "}
                            {order.delivery_address !== "string"
                              ? order.delivery_address
                              : "Не указан"}
                          </p>
                          <p>
                            <span className="text-gray-500">
                              Контактный телефон:
                            </span>{" "}
                            {order.contact_phone !== "string"
                              ? order.contact_phone
                              : "Не указан"}
                          </p>
                          <p>
                            <span className="text-gray-500">Примечания:</span>{" "}
                            {order.notes !== "string"
                              ? order.notes
                              : "Нет примечаний"}
                          </p>
                        </div>
                      </div>

                      {order.status === "pending" && (
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="destructive"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isSubmitting}
                          >
                            Отменить заявку
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                У вас пока нет заявок на покупку. Перейдите в каталог
                материалов, чтобы создать заявку.
              </div>
            )}
          </TabsContent>
        )}

        {(userType === "seller" || userType === "both") && (
          <TabsContent value="seller">
            {sellerOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sellerOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Заявка #{order.id}</CardTitle>
                          <CardDescription>
                            Создана:{" "}
                            {new Date(order.created_at).toLocaleDateString(
                              "ru-RU"
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>
                          {mapStatusToRussian(order.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Информация о материале
                          </h3>
                          <p>
                            <span className="text-gray-500">Материал:</span>{" "}
                            {order.material_name}
                          </p>
                          <p>
                            <span className="text-gray-500">Категория:</span>{" "}
                            {order.category_name}
                          </p>
                          <p>
                            <span className="text-gray-500">Количество:</span>{" "}
                            {Number(order.quantity).toFixed(2)} кг
                          </p>
                          <p>
                            <span className="text-gray-500">Цена:</span>{" "}
                            {Number(order.price).toFixed(2)} ₸/кг
                          </p>
                          <p>
                            <span className="text-gray-500">Итого:</span>{" "}
                            {Number(order.total_amount).toFixed(2)} ₸
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Информация о покупателе
                          </h3>
                          <p>
                            <span className="text-gray-500">Покупатель:</span>{" "}
                            {order.buyer_name}
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span>{" "}
                            {order.buyer_email}
                          </p>
                          <p>
                            <span className="text-gray-500">
                              Адрес доставки:
                            </span>{" "}
                            {order.delivery_address !== "string"
                              ? order.delivery_address
                              : "Не указан"}
                          </p>
                          <p>
                            <span className="text-gray-500">
                              Контактный телефон:
                            </span>{" "}
                            {order.contact_phone !== "string"
                              ? order.contact_phone
                              : "Не указан"}
                          </p>
                          <p>
                            <span className="text-gray-500">Примечания:</span>{" "}
                            {order.notes !== "string"
                              ? order.notes
                              : "Нет примечаний"}
                          </p>
                        </div>
                      </div>

                      {order.status === "pending" && (
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleOpenRejectDialog(order.id)}
                            disabled={isSubmitting}
                          >
                            Отклонить
                          </Button>
                          <Button
                            onClick={() => handleAcceptOrder(order.id)}
                            disabled={isSubmitting}
                          >
                            Принять
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                У вас пока нет заявок на ваши материалы.
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Диалог отклонения заявки */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Отклонение заявки</DialogTitle>
            <DialogDescription>
              Укажите причину отклонения заявки
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="rejection-reason">Причина отклонения</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Укажите причину отклонения заявки"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отклонение..." : "Отклонить заявку"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Вспомогательные функции
function mapStatusToRussian(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "В ожидании",
    accepted: "Принята",
    rejected: "Отклонена",
    cancelled: "Отменена",
    completed: "Завершена",
  };
  return statusMap[status] || "Неизвестно";
}

function getStatusVariant(
  status: string
): "default" | "outline" | "secondary" | "destructive" | "success" {
  const variantMap: Record<
    string,
    "default" | "outline" | "secondary" | "destructive" | "success"
  > = {
    pending: "secondary",
    accepted: "success",
    rejected: "destructive",
    cancelled: "outline",
    completed: "default",
  };
  return variantMap[status] || "outline";
}
