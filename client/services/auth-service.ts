import { v4 as uuidv4 } from "uuid";

const API_BASE_URL = "https://recycling-marketplace-backend.onrender.com/api";
const REGISTER_ENDPOINT = `${API_BASE_URL}/users/register`;
const LOGIN_ENDPOINT = `${API_BASE_URL}/users/login`;

const ADMIN_SESSIONS_KEY = "eco_market_admin_sessions";

const MOCK_USERS = [
  {
    id: "admin1",
    name: "Администратор",
    email: "admin@ecomarket.ru",
    password: "admin123",
    type: "staff",
    role: "admin",
    status: "active",
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

const apiRequest = async (url: string, method: string, data?: any) => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("admin_token");

    console.log(
      `[Auth Service] Making ${method} request to ${url} with token: ${
        token ? "present" : "missing"
      }`
    );

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `API request failed with status ${response.status}:`,
        errorData
      );
      throw new Error(
        errorData.message || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

export const adminLogin = async (email: string, password: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = MOCK_USERS.find(
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

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  userType: string
) => {
  console.log("[Auth Service] Attempting registration for:", email);

  try {
    if (MOCK_USERS.some((u) => u.email === email)) {
      throw new Error("User already exists");
    }

    const userData = await apiRequest(REGISTER_ENDPOINT, "POST", {
      name,
      email,
      password,
      userType,
    });
    console.log("[Auth Service] Registration response:", userData);

    try {
      const users = JSON.parse(
        localStorage.getItem("eco_market_users") || "[]"
      );

      let role = "user";
      let type = userType;

      if (userType === "manager" || userType === "admin") {
        role = userType;
        type = "staff";
      }

      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password,
        type,
        role,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("eco_market_users", JSON.stringify(users));

      localStorage.setItem("user_type", type);
      localStorage.setItem("user_role", role);

      console.log(
        `[Auth Service] User registered with type: ${type}, role: ${role}`
      );
    } catch (error) {
      console.error("Error storing user data:", error);
    }

    return { success: true, userData };
  } catch (error) {
    console.error("[Auth Service] Registration error:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  console.log("[Auth Service] Attempting login for:", email);

  try {
    const mockUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (mockUser) {
      console.log("[Auth Service] Mock user found:", mockUser.name);
      console.log("[Auth Service] Mock user type:", mockUser.type);

      localStorage.setItem("last_login_email", email);

      localStorage.setItem("user_type", mockUser.type);
      localStorage.setItem("user_role", mockUser.role);

      const token = `token_${uuidv4()}`;

      const { password: _, ...userWithoutPassword } = mockUser;

      return { token, user: userWithoutPassword };
    }

    const data = await apiRequest(LOGIN_ENDPOINT, "POST", { email, password });
    console.log("[Auth Service] Login response:", data);

    if (data.token) {
      localStorage.setItem("last_login_email", email);

      let userType = data.user?.userType || "buyer";
      let userRole = "user";

      if (data.user && data.user.userType) {
        if (
          data.user.userType === "manager" ||
          data.user.userType === "admin"
        ) {
          userRole = data.user.userType;
          userType = "staff";
        } else {
          userType = data.user.userType;
          userRole = "user";
        }
      } else {
        try {
          const registeredUsers = JSON.parse(
            localStorage.getItem("eco_market_users") || "[]"
          );
          const registeredUser = registeredUsers.find(
            (u: any) => u.email === email
          );
          if (registeredUser) {
            userType = registeredUser.type || userType;
            userRole = registeredUser.role || userRole;
          }
        } catch (error) {
          console.error("Error retrieving user info:", error);
        }
      }

      try {
        const userProfileResponse = await fetch(
          `${API_BASE_URL}/users/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        if (userProfileResponse.ok) {
          const userProfileData = await userProfileResponse.json();
          if (userProfileData.userType) {
            console.log(
              "[Auth Service] User type from server:",
              userProfileData.userType
            );
            userType = userProfileData.userType;
          }
        }
      } catch (error) {
        console.warn(
          "[Auth Service] Could not fetch user type from server:",
          error
        );
      }

      localStorage.setItem("user_type", userType);
      localStorage.setItem("user_role", userRole);

      console.log(
        `[Auth Service] User logged in with type: ${userType}, role: ${userRole}`
      );

      const user = {
        id: data.user?.id || "user_id",
        name: data.user?.name || email.split("@")[0],
        email,
        type: userType,
        role: userRole,
        status: "active",
      };

      console.log("[Auth Service] User object created:", user);

      return { token: data.token, user };
    }

    throw new Error("Invalid credentials");
  } catch (error) {
    console.error("[Auth Service] Login error:", error);
    throw error;
  }
};

export const getUserProfile = async (token: string) => {
  console.log("[Auth Service] Getting user profile for token:", token);

  if (token.startsWith("admin_")) {
    console.log("[Auth Service] Admin token detected");

    const email = localStorage.getItem("last_login_email");
    const adminUser = MOCK_USERS.find(
      (u) => u.email === email && (u.role === "admin" || u.role === "manager")
    );

    if (adminUser) {
      const { password: _, ...userWithoutPassword } = adminUser;
      return userWithoutPassword;
    }
  }

  const email = localStorage.getItem("last_login_email");

  if (email) {
    const mockUser = MOCK_USERS.find((u) => u.email === email);

    if (mockUser) {
      const { password: _, ...userWithoutPassword } = mockUser;
      console.log(
        "[Auth Service] Returning mock user profile:",
        userWithoutPassword
      );

      localStorage.setItem("user_type", mockUser.type);
      localStorage.setItem("user_role", mockUser.role);

      return userWithoutPassword;
    }

    try {
      const registeredUsers = JSON.parse(
        localStorage.getItem("eco_market_users") || "[]"
      );
      const registeredUser = registeredUsers.find(
        (u: any) => u.email === email
      );

      if (registeredUser) {
        const { password: _, ...userWithoutPassword } = registeredUser;
        console.log(
          "[Auth Service] Returning registered user profile:",
          userWithoutPassword
        );

        localStorage.setItem("user_type", registeredUser.type);
        localStorage.setItem("user_role", registeredUser.role);

        return userWithoutPassword;
      }

      const userType = localStorage.getItem("user_type") || "buyer";
      const userRole = localStorage.getItem("user_role") || "user";

      const user = {
        id: "user_id",
        name: email.split("@")[0],
        email,
        type: userType,
        role: userRole,
        status: "active",
      };

      console.log(
        "[Auth Service] Restored user profile from localStorage:",
        user
      );
      return user;
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      throw error;
    }
  }

  throw new Error("User not found");
};

export const logout = () => {
  localStorage.removeItem("last_login_email");
  localStorage.removeItem("user_type");
  localStorage.removeItem("user_role");
  return { success: true };
};

export const getUserTypeFromServer = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user type: ${response.status}`);
    }

    const userData = await response.json();
    console.log("[Auth Service] User type from server:", userData.userType);

    if (userData.userType) {
      localStorage.setItem("user_type", userData.userType);
    }

    return userData.userType;
  } catch (error) {
    console.error(
      "[Auth Service] Error fetching user type from server:",
      error
    );
    return localStorage.getItem("user_type");
  }
};

export const getCurrentUserType = async () => {
  const serverType = await getUserTypeFromServer().catch(() => null);

  if (serverType) {
    return serverType;
  }

  return localStorage.getItem("user_type") || "";
};

export const updateUserType = async (newType: string) => {
  if (newType !== "buyer" && newType !== "seller" && newType !== "staff") {
    console.error("[Auth Service] Invalid user type:", newType);
    return false;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/users/update-type`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userType: newType }),
    });

    if (!response.ok) {
      console.warn(
        "[Auth Service] Failed to update user type on server, updating localStorage only"
      );
      localStorage.setItem("user_type", newType);
      return true;
    }

    localStorage.setItem("user_type", newType);

    const currentRole = localStorage.getItem("user_role") || "user";

    if (
      newType !== "staff" &&
      (currentRole === "admin" || currentRole === "manager")
    ) {
      localStorage.setItem("user_role", "user");
    }

    console.log("[Auth Service] User type updated to:", newType);
    console.log(
      "[Auth Service] User role is:",
      localStorage.getItem("user_role")
    );

    return true;
  } catch (error) {
    console.error("[Auth Service] Error updating user type on server:", error);

    localStorage.setItem("user_type", newType);
    return true;
  }
};

export const updateUserRole = (newRole: string) => {
  if (newRole !== "user" && newRole !== "manager" && newRole !== "admin") {
    console.error("[Auth Service] Invalid user role:", newRole);
    return false;
  }

  localStorage.setItem("user_role", newRole);

  if (newRole === "admin" || newRole === "manager") {
    localStorage.setItem("user_type", "staff");
  }

  console.log("[Auth Service] User role updated to:", newRole);
  console.log(
    "[Auth Service] User type is:",
    localStorage.getItem("user_type")
  );

  const email = localStorage.getItem("last_login_email");
  if (email) {
    try {
      const users = JSON.parse(
        localStorage.getItem("eco_market_users") || "[]"
      );
      const userIndex = users.findIndex((u: any) => u.email === email);

      if (userIndex !== -1) {
        users[userIndex].role = newRole;
        if (newRole === "admin" || newRole === "manager") {
          users[userIndex].type = "staff";
        }
        localStorage.setItem("eco_market_users", JSON.stringify(users));
        console.log(
          "[Auth Service] Updated user role and type in stored users"
        );
      }
    } catch (error) {
      console.error("Error updating user role in localStorage:", error);
    }
  }

  return true;
};

export const getCurrentUserRole = () => {
  return localStorage.getItem("user_role") || "user";
};

export const refreshUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return await getUserProfile(token);
  } catch (error) {
    console.error("Error refreshing user data:", error);
    return null;
  }
};

export const forceUpdateUserTypeFromServer = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        `[Auth Service] Failed to fetch user profile: ${response.status}`
      );
      return false;
    }

    const userData = await response.json();

    if (userData.userType) {
      console.log(
        "[Auth Service] Forced update - User type from server:",
        userData.userType
      );

      localStorage.setItem("user_type", userData.userType);

      return true;
    }

    return false;
  } catch (error) {
    console.error(
      "[Auth Service] Error during forced update of user type:",
      error
    );
    return false;
  }
};
