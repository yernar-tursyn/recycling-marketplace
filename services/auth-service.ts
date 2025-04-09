import type { UserType } from "@/types/user";
import { v4 as uuidv4 } from "uuid";

const USERS_KEY = "eco_market_users";

const getUsers = (): UserType[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const saveUsers = (users: UserType[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const loginUser = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const token = `token_${uuidv4()}`;

  const { password: _, ...userWithoutPassword } = user;

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

  const users = getUsers();

  if (users.length === 0) {
    throw new Error("User not found");
  }

  const { password: _, ...userWithoutPassword } = users[0];

  return userWithoutPassword;
};
