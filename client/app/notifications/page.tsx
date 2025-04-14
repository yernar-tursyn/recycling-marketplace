"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useNotifications } from "@/context/notifications-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { markAllAsRead } from "@/services/notification-service";
import {
  Bell,
  CheckCheck,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

export default function NotificationsPage() {
  const { user, isLoading } = useAuth();
  const {
    notifications,
    markNotificationAsRead,
    isLoading: notificationsLoading,
  } = useNotifications();
  const router = useRouter();
  const { toast } = useToast();

  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    setIsMarkingAllAsRead(true);

    try {
      await markAllAsRead(user.id);

      notifications.forEach((notification) => {
        if (!notification.read) {
          markNotificationAsRead(notification.id);
        }
      });

      toast({
        title: "Уведомления прочитаны",
        description: "Все уведомления отмечены как прочитанные",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось отметить уведомления как прочитанные",
      });
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    if (activeTab === "read") return notification.read;
    return true;
  });

  if (isLoading || notificationsLoading || !user) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <p className="text-muted-foreground">Загрузка уведомлений...</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Уведомления</h1>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="mr-2">
              {unreadCount} непрочитанных
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} disabled={isMarkingAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Отметить все как прочитанные
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Центр уведомлений</CardTitle>
          <CardDescription>
            Здесь вы можете просматривать все уведомления о действиях на
            платформе, связанных с вашим аккаунтом.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="unread">Непрочитанные</TabsTrigger>
              <TabsTrigger value="read">Прочитанные</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredNotifications.length > 0 ? (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.read ? "bg-muted/50" : "bg-card"
                      } transition-colors`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          {notification.type ? (
                            getNotificationIcon(notification.type)
                          ) : (
                            <Bell
                              className={`h-5 w-5 ${
                                notification.read
                                  ? "text-muted-foreground"
                                  : "text-primary"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3
                                className={`font-medium ${
                                  notification.read
                                    ? "text-muted-foreground"
                                    : ""
                                }`}
                              >
                                {notification.title}
                              </h3>
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" />
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  markNotificationAsRead(notification.id)
                                }
                              >
                                Отметить как прочитанное
                              </Button>
                            )}
                          </div>
                          <Separator className="my-2" />
                          <p className="text-sm">{notification.message}</p>
                          {notification.actionUrl && (
                            <Button
                              variant="link"
                              className="p-0 h-auto mt-2"
                              onClick={() =>
                                router.push(notification.actionUrl || "/")
                              }
                            >
                              {notification.actionText || "Подробнее"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    {activeTab === "all"
                      ? "У вас пока нет уведомлений"
                      : activeTab === "unread"
                      ? "У вас нет непрочитанных уведомлений"
                      : "У вас нет прочитанных уведомлений"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
