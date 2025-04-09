import type { NotificationType } from "@/types/notification";
import { v4 as uuidv4 } from "uuid";

const NOTIFICATIONS_KEY = "eco_market_notifications";

const getNotificationsFromStorage = (): Record<string, NotificationType[]> => {
  const notifications = localStorage.getItem(NOTIFICATIONS_KEY);

  if (notifications) {
    return JSON.parse(notifications);
  }

  const initialNotifications: Record<string, NotificationType[]> = {
    user1: [
      {
        id: uuidv4(),
        userId: "user1",
        title: "Новая заявка",
        message: "Ваша заявка на сдачу макулатуры была принята",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        userId: "user1",
        title: "Сделка завершена",
        message: "Сделка по сдаче электроники успешно завершена",
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
    ],
    user2: [
      {
        id: uuidv4(),
        userId: "user2",
        title: "Новое сообщение",
        message: "У вас новое сообщение от пользователя Иван Петров",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifications));
  return initialNotifications;
};

const saveNotifications = (
  notificationsMap: Record<string, NotificationType[]>
) => {
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notificationsMap));
};

export const getNotifications = async (userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const notificationsMap = getNotificationsFromStorage();
  return notificationsMap[userId] || [];
};

export const createNotification = async (
  notification: Omit<NotificationType, "id" | "createdAt" | "read">
) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const notificationsMap = getNotificationsFromStorage();

  const newNotification: NotificationType = {
    ...notification,
    id: uuidv4(),
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (!notificationsMap[notification.userId]) {
    notificationsMap[notification.userId] = [];
  }

  notificationsMap[notification.userId].unshift(newNotification);

  saveNotifications(notificationsMap);

  return newNotification;
};

export const markAsRead = async (notificationId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const notificationsMap = getNotificationsFromStorage();

  for (const userId in notificationsMap) {
    const userNotifications = notificationsMap[userId];
    const index = userNotifications.findIndex((n) => n.id === notificationId);

    if (index !== -1) {
      userNotifications[index].read = true;
      saveNotifications(notificationsMap);
      return userNotifications[index];
    }
  }

  throw new Error("Notification not found");
};

export const markAllAsRead = async (userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const notificationsMap = getNotificationsFromStorage();

  if (!notificationsMap[userId]) {
    return [];
  }

  notificationsMap[userId] = notificationsMap[userId].map((notification) => ({
    ...notification,
    read: true,
  }));

  saveNotifications(notificationsMap);

  return notificationsMap[userId];
};
