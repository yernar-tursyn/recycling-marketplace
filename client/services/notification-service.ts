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
        type: "success",
        actionUrl: "/profile/applications",
        actionText: "Перейти к заявкам",
      },
      {
        id: uuidv4(),
        userId: "user1",
        title: "Сделка завершена",
        message: "Сделка по сдаче электроники успешно завершена",
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        type: "info",
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
        type: "info",
        actionUrl: "/messages",
        actionText: "Прочитать",
      },
    ],
    admin1: [
      {
        id: uuidv4(),
        userId: "admin1",
        title: "Новый материал на проверке",
        message:
          "Пользователь Иван Петров добавил новый материал, требующий проверки",
        read: false,
        createdAt: new Date().toISOString(),
        type: "warning",
        actionUrl: "/admin/materials",
        actionText: "Проверить",
        relatedUserId: "user1",
        relatedEntityType: "material",
      },
    ],
    manager1: [
      {
        id: uuidv4(),
        userId: "manager1",
        title: "Новая заявка требует внимания",
        message: "Поступила новая заявка от пользователя Анна Иванова",
        read: false,
        createdAt: new Date().toISOString(),
        type: "info",
        actionUrl: "/admin/applications",
        actionText: "Просмотреть",
        relatedUserId: "user2",
        relatedEntityType: "application",
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

export const createNotificationForUser = async (
  userId: string,
  title: string,
  message: string,
  options: {
    type?: string;
    actionUrl?: string;
    actionText?: string;
    relatedUserId?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  } = {}
) => {
  return createNotification({
    userId,
    title,
    message,
    ...options,
  });
};

export const createNotificationForStaff = async (
  title: string,
  message: string,
  options: {
    type?: string;
    actionUrl?: string;
    actionText?: string;
    relatedUserId?: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
  } = {}
) => {
  const users = JSON.parse(localStorage.getItem("eco_market_users") || "[]");
  const staffUsers = users.filter(
    (user: any) => user.role === "admin" || user.role === "manager"
  );

  const promises = staffUsers.map((user: any) =>
    createNotification({
      userId: user.id,
      title,
      message,
      ...options,
    })
  );

  await Promise.all(promises);
  return { success: true };
};

export const createApplicationNotification = async (
  applicationId: string,
  applicationTitle: string,
  userId: string,
  sellerUserId: string
) => {
  await createNotificationForUser(
    userId,
    "Заявка создана",
    `Ваша заявка "${applicationTitle}" успешно создана`,
    {
      type: "success",
      actionUrl: "/profile/applications",
      actionText: "Перейти к заявкам",
      relatedEntityId: applicationId,
      relatedEntityType: "application",
    }
  );

  await createNotificationForUser(
    sellerUserId,
    "Новая заявка",
    `Поступила новая заявка "${applicationTitle}" от пользователя`,
    {
      type: "info",
      actionUrl: "/profile/applications",
      actionText: "Просмотреть заявку",
      relatedUserId: userId,
      relatedEntityId: applicationId,
      relatedEntityType: "application",
    }
  );

  await createNotificationForStaff(
    "Новая заявка в системе",
    `Создана новая заявка "${applicationTitle}"`,
    {
      type: "info",
      actionUrl: "/admin/applications",
      actionText: "Просмотреть",
      relatedUserId: userId,
      relatedEntityId: applicationId,
      relatedEntityType: "application",
    }
  );

  return { success: true };
};

export const createMaterialNotification = async (
  materialId: string,
  materialName: string,
  userId: string,
  status: string
) => {
  await createNotificationForUser(
    userId,
    status === "active"
      ? "Материал одобрен"
      : status === "rejected"
      ? "Материал отклонен"
      : "Материал на проверке",
    status === "active"
      ? `Ваш материал "${materialName}" был одобрен и опубликован`
      : status === "rejected"
      ? `Ваш материал "${materialName}" был отклонен. Пожалуйста, проверьте требования и попробуйте снова`
      : `Ваш материал "${materialName}" отправлен на проверку`,
    {
      type:
        status === "active"
          ? "success"
          : status === "rejected"
          ? "error"
          : "info",
      actionUrl: `/profile/materials`,
      actionText: "Перейти к материалам",
      relatedEntityId: materialId,
      relatedEntityType: "material",
    }
  );

  if (status === "pending") {
    await createNotificationForStaff(
      "Новый материал требует проверки",
      `Пользователь добавил новый материал "${materialName}"`,
      {
        type: "warning",
        actionUrl: "/admin/materials",
        actionText: "Проверить",
        relatedUserId: userId,
        relatedEntityId: materialId,
        relatedEntityType: "material",
      }
    );
  }

  return { success: true };
};

export const createApplicationStatusNotification = async (
  applicationId: string,
  applicationTitle: string,
  userId: string,
  status: string,
  updatedByUserId: string
) => {
  await createNotificationForUser(
    userId,
    status === "completed"
      ? "Заявка завершена"
      : status === "cancelled"
      ? "Заявка отменена"
      : "Статус заявки изменен",
    status === "completed"
      ? `Ваша заявка "${applicationTitle}" была успешно завершена`
      : status === "cancelled"
      ? `Ваша заявка "${applicationTitle}" была отменена`
      : `Статус вашей заявки "${applicationTitle}" был изменен на "${
          status === "active" ? "Активна" : status
        }"`,
    {
      type:
        status === "completed"
          ? "success"
          : status === "cancelled"
          ? "error"
          : "info",
      actionUrl: "/profile/applications",
      actionText: "Перейти к заявкам",
      relatedUserId: updatedByUserId,
      relatedEntityId: applicationId,
      relatedEntityType: "application",
    }
  );

  return { success: true };
};

export const getUnreadNotificationsCount = async (userId: string) => {
  const notifications = await getNotifications(userId);
  return notifications.filter((n) => !n.read).length;
};

export const deleteNotification = async (notificationId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const notificationsMap = getNotificationsFromStorage();

  for (const userId in notificationsMap) {
    const userNotifications = notificationsMap[userId];
    const index = userNotifications.findIndex((n) => n.id === notificationId);

    if (index !== -1) {
      userNotifications.splice(index, 1);
      saveNotifications(notificationsMap);
      return { success: true };
    }
  }

  throw new Error("Notification not found");
};

export const deleteAllNotifications = async (userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const notificationsMap = getNotificationsFromStorage();

  if (notificationsMap[userId]) {
    notificationsMap[userId] = [];
    saveNotifications(notificationsMap);
  }

  return { success: true };
};
