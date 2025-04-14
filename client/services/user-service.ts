import api from "./api";
import type { UserType } from "@/types/user";

export const getAllUsers = async () => {
  try {
    const response = await api.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (id: string, updates: Partial<UserType>) => {
  try {
    const response = await api.patch(`/users/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const updateUserStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for user ${id}:`, error);
    throw error;
  }
};

export const updateUserRole = async (id: string, role: string) => {
  try {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  } catch (error) {
    console.error(`Error updating role for user ${id}:`, error);
    throw error;
  }
};

// Дополнительные методы для аутентификации
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    localStorage.setItem("authToken", response.data.token);
    return response.data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async () => {
  localStorage.removeItem("authToken");
};
