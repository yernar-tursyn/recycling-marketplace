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
      quantity: 50,
      price: 15,
      userId: "user1",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Куплю алюминиевые банки",
      description: "Принимаю алюминиевые банки от напитков в любом количестве",
      materialType: "metal",
      quantity: 100,
      price: 80,
      userId: "user2",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      title: "Сдам старую электронику",
      description: "Старые компьютеры, телефоны, платы",
      materialType: "electronics",
      quantity: 30,
      price: 200,
      userId: "user1",
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

  const newApplication: ApplicationType = {
    ...application,
    id: uuidv4(),
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveApplications([...applications, newApplication]);

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

export const deleteApplication = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const applications = getApplicationsFromStorage();
  const filteredApplications = applications.filter((a) => a.id !== id);

  saveApplications(filteredApplications);

  return { success: true };
};

export const getUserApplications = async (userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const applications = getApplicationsFromStorage();
  return applications.filter((a) => a.userId === userId);
};
