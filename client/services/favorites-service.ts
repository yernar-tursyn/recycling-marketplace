const API_BASE_URL = "https://recycling-marketplace-backend.onrender.com/api";

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const createAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const getFavorites = async (userId: string): Promise<string[]> => {
  try {
    const headers = createAuthHeaders();
    console.log(
      `[Favorites Service] Getting favorites for user ${userId} with auth:`,
      !!headers["Authorization"]
    );

    const response = await fetch(`${API_BASE_URL}/favorites/${userId}`, {
      headers,
    });

    if (response.status === 401) {
      console.error("Unauthorized: Token is invalid or expired");
      return [];
    }

    if (!response.ok) {
      console.error(
        `Error fetching favorites: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();
    console.log(`[Favorites Service] Received favorites data:`, data);

    return Array.isArray(data)
      ? data.map((item) => item.materialId.toString())
      : [];
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
};

export const addToFavorites = async (
  userId: string,
  materialId: string
): Promise<string[]> => {
  try {
    const headers = createAuthHeaders();
    console.log(
      `[Favorites Service] Adding material ${materialId} to favorites for user ${userId}`
    );

    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId: Number.parseInt(userId),
        materialId: Number.parseInt(materialId),
      }),
    });

    if (response.status === 401) {
      console.error("Unauthorized: Token is invalid or expired");
      throw new Error("Unauthorized: Please log in again");
    }

    if (!response.ok) {
      console.error(
        `Error adding to favorites: ${response.status} ${response.statusText}`
      );
      throw new Error("Failed to add to favorites");
    }

    return await getFavorites(userId);
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

export const removeFromFavorites = async (
  userId: string,
  materialId: string
): Promise<string[]> => {
  try {
    const headers = createAuthHeaders();
    console.log(
      `[Favorites Service] Removing material ${materialId} from favorites for user ${userId}`
    );

    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        userId: Number.parseInt(userId),
        materialId: Number.parseInt(materialId),
      }),
    });

    if (response.status === 401) {
      console.error("Unauthorized: Token is invalid or expired");
      throw new Error("Unauthorized: Please log in again");
    }

    if (!response.ok) {
      console.error(
        `Error removing from favorites: ${response.status} ${response.statusText}`
      );
      throw new Error("Failed to remove from favorites");
    }

    return await getFavorites(userId);
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

export const checkIsFavorite = async (
  userId: string,
  materialId: string
): Promise<boolean> => {
  try {
    const headers = createAuthHeaders();
    console.log(
      `[Favorites Service] Checking if material ${materialId} is favorite for user ${userId}`
    );

    const response = await fetch(`${API_BASE_URL}/favorites/check`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        userId: Number.parseInt(userId),
        materialId: Number.parseInt(materialId),
      }),
    });

    if (response.status === 401) {
      console.error("Unauthorized: Token is invalid or expired");
      return false;
    }

    if (!response.ok) {
      console.error(
        `Error checking favorite status: ${response.status} ${response.statusText}`
      );
      return false;
    }

    const data = await response.json();
    return data.isFavorite === true;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};
