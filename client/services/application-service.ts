import type { ApplicationType } from "@/types/application";
import { v4 as uuidv4 } from "uuid";

const APPLICATIONS_KEY = "eco_market_applications";

const getApplicationsFromStorage = (): ApplicationType[] => {
  const applications = localStorage.getItem(APPLICATIONS_KEY);

  if (applications) {
    return JSON.parse(applications);
  }

  const initialApplications = [
    {
      id: uuidv4(),
      title: "Сдам 50 кг макулатуры",
      description: "Газеты, журналы, книги в хорошем состоянии",
      materialType: "paper",
      materialId: "material1",
      sellerUserId: "user1",
      quantity: 50,
      price: 15,
      userId: "user1",
      userName: "Иван Петров",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Куплю алюминиевые банки",
      description: "Принимаю алюминиевые банки от напитков в любом количестве",
      materialType: "metal",
      materialId: "material2",
      sellerUserId: "user1",
      quantity: 100,
      price: 80,
      userId: "user2",
      userName: "Анна Иванова",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Сдам старую электронику",
      description: "Старые компьютеры, телефоны, платы",
      materialType: "electronics",
      materialId: "material3",
      sellerUserId: "user2",
      quantity: 30,
      price: 200,
      userId: "user1",
      userName: "Иван Петров",
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(initialApplications));
  return initialApplications;
};

const saveApplications = (applications: ApplicationType[]) => {
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
};

export const getApplications = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return getApplicationsFromStorage();
};

export const getAllApplications = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return getApplicationsFromStorage();
};

export const getApplicationById = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const applications = getApplicationsFromStorage();
  const application = applications.find((a) => a.id === id);

  if (!application) {
    throw new Error("Application not found");
  }

  return application;
};

export const createApplication = async (
  application: Omit<
    ApplicationType,
    "id" | "createdAt" | "updatedAt" | "status"
  >
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const applications = getApplicationsFromStorage();

  let userName = "Пользователь";
  let userType = "buyer";
  try {
    const users = JSON.parse(localStorage.getItem("eco_market_users") || "[]");
    const user = users.find((u: any) => u.id === application.userId);
    if (user) {
      userName = user.name;
      userType = user.type;
    }
  } catch (error) {
    console.error("Error getting user info:", error);
  }

  const status = userType === "buyer" ? "active" : "pending";

  const newApplication: ApplicationType = {
    ...application,
    id: uuidv4(),
    status: status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userName,
  };

  saveApplications([...applications, newApplication]);

  if (userType === "seller") {
    try {
      const { createNotificationForStaff } = await import(
        "@/services/notification-service"
      );
      await createNotificationForStaff(
        "Новая заявка требует проверки",
        `Продавец ${userName} создал новую заявку "${newApplication.title}"`,
        {
          type: "warning",
          actionUrl: "/admin/applications",
          actionText: "Проверить заявку",
          relatedUserId: application.userId,
          relatedEntityId: newApplication.id,
          relatedEntityType: "application",
        }
      );
    } catch (error) {
      console.error("Error sending notification to admins:", error);
    }
  } else if (userType === "buyer" && application.sellerUserId) {
    try {
      const { createNotificationForUser } = await import(
        "@/services/notification-service"
      );
      await createNotificationForUser(
        application.sellerUserId,
        "Новая заявка на ваш материал",
        `Покупатель ${userName} создал новую заявку "${newApplication.title}"`,
        {
          type: "info",
          actionUrl: "/profile/applications",
          actionText: "Просмотреть заявку",
          relatedUserId: application.userId,
          relatedEntityId: newApplication.id,
          relatedEntityType: "application",
        }
      );
    } catch (error) {
      console.error("Error sending notification to seller:", error);
    }
  }

  return newApplication;
};

export const updateApplication = async (
  id: string,
  updates: Partial<ApplicationType>
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const applications = getApplicationsFromStorage();
  const index = applications.findIndex((a) => a.id === id);

  if (index === -1) {
    throw new Error("Application not found");
  }

  const updatedApplication = {
    ...applications[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  applications[index] = updatedApplication;

  saveApplications(applications);

  return updatedApplication;
};

export const updateApplicationStatus = async (id: string, status: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const applications = getApplicationsFromStorage();
  const index = applications.findIndex((a) => a.id === id);

  if (index === -1) {
    throw new Error("Application not found");
  }

  applications[index].status = status;
  applications[index].updatedAt = new Date().toISOString();

  saveApplications(applications);

  const token =
    localStorage.getItem("token") || localStorage.getItem("admin_token");

  try {
    const API_URL =
      "https://recycling-marketplace-backend.onrender.com/api/applications";
    const updateUrl = `${API_URL}/${id}`;

    console.log(`Updating application status in API: ${updateUrl}`);

    const applicationToUpdate = applications[index];

    const response = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(applicationToUpdate),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API request failed with status ${response.status}: ${errorText}`
      );
    } else {
      const result = await response.json();
      console.log("Application status successfully updated in API:", result);
    }
  } catch (error) {
    console.error("Failed to update application status in API:", error);
  }

  return applications[index];
};

export const deleteApplication = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const applications = getApplicationsFromStorage();
  const filteredApplications = applications.filter((a) => a.id !== id);

  saveApplications(filteredApplications);

  return { success: true };
};

export const getUserApplications = async (
  userId: string,
  userType?: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const applications = getApplicationsFromStorage();

  if (userType === "seller") {
    return applications.filter(
      (a) => a.sellerUserId === userId || a.userId === userId
    );
  }

  return applications.filter((a) => a.userId === userId);
};

export const createApplicationStatusNotification = async (
  applicationId: string,
  applicationTitle: string,
  userId: string,
  status: string,
  updatedByUserId: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { createNotificationForUser } = await import(
    "@/services/notification-service"
  );

  await createNotificationForUser(
    userId,
    status === "completed" ? "Заявка принята" : "Заявка отклонена",
    status === "completed"
      ? `Ваша заявка "${applicationTitle}" была принята продавцом`
      : `Ваша заявка "${applicationTitle}" была отклонена продавцом`,
    {
      type: status === "completed" ? "success" : "error",
      actionUrl: "/profile/applications",
      actionText: "Перейти к заявкам",
      relatedUserId: updatedByUserId,
      relatedEntityId: applicationId,
      relatedEntityType: "application",
    }
  );

  return { success: true };
};
