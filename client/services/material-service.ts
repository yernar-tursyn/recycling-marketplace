import type { MaterialType } from "@/types/material";

const API_URL =
  "https://recycling-marketplace-backend.onrender.com/api/materials";

const mapApiMaterialToAppMaterial = (apiMaterial: any): MaterialType => {
  return {
    id: apiMaterial.id.toString(),
    name: apiMaterial.name || "Без названия",
    type: apiMaterial.category_id
      ? mapCategoryIdToType(apiMaterial.category_id)
      : "other",
    description: apiMaterial.description || "",
    price: Number.parseFloat(apiMaterial.price) || 0,
    quantity: apiMaterial.quantity || 100, // Устанавливаем значение по умолчанию
    image: apiMaterial.image_url || null,
    userId: apiMaterial.user_id || "admin",
    userName: apiMaterial.user_name || "Администратор",
    status: mapApiStatusToAppStatus(apiMaterial.status),
    createdAt: apiMaterial.created_at || new Date().toISOString(),
    dealType: apiMaterial.deal_type || "sell", // Устанавливаем значение по умолчанию
  };
};

const mapCategoryIdToType = (categoryId: number): string => {
  const categoryMap: { [key: number]: string } = {
    1: "plastic",
    2: "paper",
    3: "glass",
    4: "metal",
    5: "other",
    6: "organic",
    7: "other",
  };
  return categoryMap[categoryId] || "other";
};

const mapApiStatusToAppStatus = (apiStatus: string): string => {
  const statusMap: { [key: string]: string } = {
    Approved: "active",
    "Under review": "pending",
    Rejected: "rejected",
  };
  return statusMap[apiStatus] || "pending";
};

export const getMaterials = async () => {
  try {
    console.log("Fetching materials from API:", API_URL);

    const response = await fetch(API_URL, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    console.log("API response status:", response.status);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiMaterials = await response.json();
    console.log("Materials from API (raw):", apiMaterials);

    if (!Array.isArray(apiMaterials)) {
      console.error("API did not return an array:", apiMaterials);
      return [];
    }

    const processedMaterials = apiMaterials.map(mapApiMaterialToAppMaterial);

    console.log("Processed materials:", processedMaterials);
    return processedMaterials;
  } catch (error) {
    console.error("Error fetching materials from API:", error);
    return [];
  }
};

export const getAllMaterials = async () => {
  return getMaterials();
};

export const getUserMaterials = async (userId: string) => {
  try {
    const allMaterials = await getMaterials();

    return allMaterials.filter((m: MaterialType) => m.userId === userId);
  } catch (error) {
    console.error("Error fetching user materials:", error);
    return [];
  }
};

export const getMaterialById = async (id: string) => {
  try {
    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const apiMaterial = await response.json();
    return mapApiMaterialToAppMaterial(apiMaterial);
  } catch (error) {
    console.error("Error fetching material by ID:", error);
    throw new Error("Material not found");
  }
};

export const createMaterial = async (
  material: Omit<MaterialType, "id" | "createdAt" | "status" | "userName">
) => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("admin_token");

    const apiMaterial = {
      name: material.name,
      category_id: getCategoryIdFromType(material.type),
      description: material.description,
      price: material.price.toString(),
      unit: "kg",
      image_url: material.image,
      status: "Under review",
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(apiMaterial),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    return mapApiMaterialToAppMaterial(responseData);
  } catch (error) {
    console.error("Error creating material:", error);
    throw error;
  }
};

const getCategoryIdFromType = (type: string): number => {
  const typeMap: { [key: string]: number } = {
    plastic: 1,
    paper: 2,
    glass: 3,
    metal: 4,
    other: 7,
    organic: 6,
  };
  return typeMap[type] || 7;
};

export const updateMaterialStatus = async (id: string, status: string) => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("admin_token");

    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const currentMaterial = await response.json();

    const apiStatus =
      status === "active"
        ? "Approved"
        : status === "pending"
        ? "Under review"
        : "Rejected";

    const updatedMaterial = {
      ...currentMaterial,
      status: apiStatus,
    };

    const updateResponse = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updatedMaterial),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(
        `API request failed with status ${updateResponse.status}: ${errorText}`
      );
      throw new Error(
        `API request failed with status ${updateResponse.status}`
      );
    }

    const result = await updateResponse.json();
    console.log("Material status successfully updated in API:", result);
    return mapApiMaterialToAppMaterial(result);
  } catch (error) {
    console.error("Failed to update material status in API:", error);
    throw error;
  }
};

export const updateMaterial = async (
  id: string,
  updates: Partial<MaterialType>
) => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("admin_token");

    const response = await fetch(`${API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const currentMaterial = await response.json();

    const apiUpdates: any = {};

    if (updates.name !== undefined) apiUpdates.name = updates.name;
    if (updates.type !== undefined)
      apiUpdates.category_id = getCategoryIdFromType(updates.type);
    if (updates.description !== undefined)
      apiUpdates.description = updates.description;
    if (updates.price !== undefined)
      apiUpdates.price = updates.price.toString();
    if (updates.image !== undefined) apiUpdates.image_url = updates.image;
    if (updates.status !== undefined) {
      apiUpdates.status =
        updates.status === "active"
          ? "Approved"
          : updates.status === "pending"
          ? "Under review"
          : "Rejected";
    }

    const updatedMaterial = {
      ...currentMaterial,
      ...apiUpdates,
    };

    const updateResponse = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updatedMaterial),
    });

    if (!updateResponse.ok) {
      throw new Error(
        `API request failed with status ${updateResponse.status}`
      );
    }

    const result = await updateResponse.json();
    return mapApiMaterialToAppMaterial(result);
  } catch (error) {
    console.error("Failed to update material in API:", error);
    throw error;
  }
};

export const updateMaterialQuantity = async (
  id: string,
  quantityChange: number
) => {
  try {
    const material = await getMaterialById(id);

    const newQuantity = material.quantity - quantityChange;

    return updateMaterial(id, { quantity: newQuantity });
  } catch (error) {
    console.error("Failed to update material quantity in API:", error);
    throw error;
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    const token =
      localStorage.getItem("token") || localStorage.getItem("admin_token");

    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    console.log("Material successfully deleted from API");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete material from API:", error);
    throw error;
  }
};

export const getMaterialsByFilter = async (filters: {
  category?: string;
  sort?: string;
}) => {
  try {
    const allMaterials = await getMaterials();

    let filteredMaterials = [...allMaterials];

    if (filters.category && filters.category !== "all") {
      filteredMaterials = filteredMaterials.filter(
        (m) => m.type === filters.category
      );
    }

    if (filters.sort === "price") {
      filteredMaterials.sort((a, b) => a.price - b.price);
    }

    return filteredMaterials;
  } catch (error) {
    console.error("Error fetching filtered materials:", error);
    return [];
  }
};
