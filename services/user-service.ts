import type { UserType } from "@/types/user";

const USERS_KEY = "eco_market_users";

const getUsers = (): UserType[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
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

export const deleteUser = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const users = getUsers();
  const filteredUsers = users.filter((u) => u.id !== id);

  if (users.length === filteredUsers.length) {
    throw new Error("User not found");
  }

  saveUsers(filteredUsers);

  return { success: true };
};
