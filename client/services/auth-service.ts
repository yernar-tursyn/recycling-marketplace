import type { UserType } from "@/types/user";
import { v4 as uuidv4 } from "uuid";

const USERS_KEY = "eco_market_users";
const ADMIN_SESSIONS_KEY = "eco_market_admin_sessions";

const getUsers = (): UserType[] => {
  console.log("[Auth Service] Getting users from localStorage");
  const users = localStorage.getItem(USERS_KEY);

  const initialUsers = [
    {
      id: "admin1",
      name: "Администратор",
      email: "admin@ecomarket.ru",
      password: "admin123",
      type: "staff",
      role: "admin",
      status: "active",
      avatar: "",
      location: "Москва",
      createdAt: new Date().toISOString(),
      bio: "Главный администратор системы",
      twoFactorEnabled: true,
    },
    {
      id: "manager1",
      name: "Менеджер",
      email: "manager@ecomarket.ru",
      password: "manager123",
      type: "staff",
      role: "manager",
      status: "active",
      avatar: "",
      location: "Санкт-Петербург",
      createdAt: new Date().toISOString(),
      bio: "Менеджер по работе с клиентами",
      twoFactorEnabled: true,
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

  if (!users) {
    console.log(
      "[Auth Service] No users found in localStorage, initializing with default users"
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }

  try {
    const parsedUsers = JSON.parse(users) as UserType[];
    console.log(
      "[Auth Service] Parsed users from localStorage:",
      parsedUsers.length
    );

    const hasAdmin = parsedUsers.some((u) => u.email === "admin@ecomarket.ru");
    const hasManager = parsedUsers.some(
      (u) => u.email === "manager@ecomarket.ru"
    );

    if (!hasAdmin || !hasManager) {
      console.log("[Auth Service] Missing default users, reinitializing");
      const missingUsers = initialUsers.filter(
        (initUser) => !parsedUsers.some((u) => u.email === initUser.email)
      );

      const updatedUsers = [...parsedUsers, ...missingUsers];
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      return updatedUsers;
    }

    return parsedUsers;
  } catch (error) {
    console.log(
      "[Auth Service] Error parsing users from localStorage, reinitializing"
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
};

const saveUsers = (users: UserType[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const adminLogin = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  const user = users.find(
    (u) =>
      u.email === email &&
      u.password === password &&
      (u.role === "admin" || u.role === "manager")
  );

  if (!user) {
    throw new Error("Invalid credentials or insufficient permissions");
  }

  const tempToken = `temp_${uuidv4()}`;

  return {
    tempToken,
    requireTwoFactor: user.twoFactorEnabled,
    userId: user.id,
  };
};

export const verifyTwoFactorCode = async (tempToken: string, code: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (code !== "123456") {
    return { success: false, token: "" };
  }

  const token = `admin_${uuidv4()}`;

  const sessions = JSON.parse(localStorage.getItem(ADMIN_SESSIONS_KEY) || "[]");
  sessions.push({
    token,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
  });
  localStorage.setItem(ADMIN_SESSIONS_KEY, JSON.stringify(sessions));

  return { success: true, token };
};

export const loginUser = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("[Auth Service] Attempting login for:", email);

  const users = getUsers();
  console.log("[Auth Service] Found users:", users.length);

  const user = users.find((u) => u.email === email && u.password === password);
  console.log("[Auth Service] User found:", !!user);

  if (!user) {
    console.log("[Auth Service] Login failed: Invalid credentials");
    throw new Error("Invalid credentials");
  }

  localStorage.setItem("last_login_email", email);
  console.log("[Auth Service] Saved last login email");

  const token = `token_${uuidv4()}`;
  console.log("[Auth Service] Generated token");

  const { password: _, ...userWithoutPassword } = user;
  console.log("[Auth Service] Login successful for:", userWithoutPassword.name);

  return { token, user: userWithoutPassword };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  type: string
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();

  if (users.some((u) => u.email === email)) {
    throw new Error("User already exists");
  }

  const newUser: UserType = {
    id: uuidv4(),
    name,
    email,
    password,
    type,
    role: "user",
    status: "active",
    avatar: "",
    location: "",
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  const token = `token_${uuidv4()}`;

  const { password: _, ...userWithoutPassword } = newUser;

  return { token, user: userWithoutPassword };
};

export const getUserProfile = async (token: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  console.log("[Auth Service] Getting user profile for token:", token);

  if (token.startsWith("admin_")) {
    console.log("[Auth Service] Admin token detected");
    const sessions = JSON.parse(
      localStorage.getItem(ADMIN_SESSIONS_KEY) || "[]"
    );
    const session = sessions.find((s: any) => s.token === token);

    if (!session) {
      console.log("[Auth Service] Invalid admin session");
      throw new Error("Invalid admin session");
    }

    const users = getUsers();
    const adminUsers = users.filter(
      (u) => u.role === "admin" || u.role === "manager"
    );

    if (adminUsers.length === 0) {
      console.log("[Auth Service] No admin users found");
      throw new Error("No admin users found");
    }

    const { password, ...userWithoutPassword } = adminUsers[0];
    console.log(
      "[Auth Service] Returning admin user:",
      userWithoutPassword.name
    );
    return userWithoutPassword;
  }

  const email = localStorage.getItem("last_login_email");
  console.log("[Auth Service] Last login email:", email);

  if (email) {
    const users = getUsers();
    const user = users.find((u) => u.email === email);
    console.log("[Auth Service] User found by email:", !!user);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      console.log("[Auth Service] Returning user:", userWithoutPassword.name);
      return userWithoutPassword;
    }
  }

  console.log("[Auth Service] User not found");
  throw new Error("User not found");
};

export const logout = () => {
  localStorage.removeItem("last_login_email");
  return { success: true };
};

export const debugUsers = () => {
  const users = getUsers();
  console.log("[DEBUG] All users in system:", users);
  return users.map(({ password, ...user }) => user); // Возвращаем пользователей без паролей
};
