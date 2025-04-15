import api from "./api";
import type { UserType } from "@/types/user";

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, updates: Partial<UserType>) => {
  const response = await api.patch(`/users/${id}`, updates);
  return response.data;
};

export const updateUserStatus = async (id: string, status: string) => {
  const response = await api.patch(`/users/${id}/status`, { status });
  return response.data;
};

export const updateUserRole = async (id: string, role: string) => {
  const response = await api.patch(`/users/${id}/role`, { role });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  localStorage.setItem("authToken", response.data.token);
  return response.data.user;
};

export const logout = async () => {
  localStorage.removeItem("authToken");
};
