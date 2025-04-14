import type { UserType } from "@/types/user";

const USERS_KEY = "eco_market_users";

const getUsers = (): UserType[] => {
  const users = localStorage.getItem(USERS_KEY);

  if (users) {
    return JSON.parse(users);
  }

  const initialUsers = [
    {
      id: "admin1",
      name: "Администратор",
      email: "admin@ecomarket.ru",
      password: "admin123",
      type: "seller",
      role: "admin",
      status: "active",
      avatar: "",
      location: "Москва",
      createdAt: new Date().toISOString(),
      bio: "Главный администратор системы",
    },
    {
      id: "manager1",
      name: "Менеджер",
      email: "manager@ecomarket.ru",
      password: "manager123",
      type: "seller",
      role: "manager",
      status: "active",
      avatar: "",
      location: "Санкт-Петербург",
      createdAt: new Date().toISOString(),
      bio: "Менеджер по работе с клиентами",
    },
    {
      id: "user1",
      name: "Иван Петров",
      email: "ivan@example.com",
      password: "password123",
      type: "seller",
      role: "user",
      status: "active",
      avatar: "",
      location: "Москва",
      createdAt: new Date().toISOString(),
      bio: "Продавец вторсырья",
    },
    {
      id: "user2",
      name: "Анна Иванова",
      email: "anna@example.com",
      password: "password123",
      type: "buyer",
      role: "user",
      status: "active",
      avatar: "",
      location: "Санкт-Петербург",
      createdAt: new Date().toISOString(),
      bio: "Покупатель вторсырья",
    },
  ];

  localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
  return initialUsers;
};

const saveUsers = (users: UserType[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getAllUsers = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();

  return users.map(({ password, ...user }) => user);
};

export const getUserById = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const users = getUsers();
  const user = users.find((u) => u.id === id);

  if (!user) {
    throw new Error("User not found");
  }

  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const updateUser = async (id: string, updates: Partial<UserType>) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    throw new Error("User not found");
  }

  const { id: _, role: __, ...allowedUpdates } = updates;

  users[index] = { ...users[index], ...allowedUpdates };

  saveUsers(users);

  const { password, ...userWithoutPassword } = users[index];

  return userWithoutPassword;
};

export const updateUserStatus = async (id: string, status: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    throw new Error("User not found");
  }

  users[index].status = status;

  saveUsers(users);

  const { password, ...userWithoutPassword } = users[index];

  return userWithoutPassword;
};

export const updateUserRole = async (id: string, role: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  const index = users.findIndex((u) => u.id === id);

  if (index === -1) {
    throw new Error("User not found");
  }

  users[index].role = role;

  saveUsers(users);

  const { password, ...userWithoutPassword } = users[index];

  return userWithoutPassword;
};
