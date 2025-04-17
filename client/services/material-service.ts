import type { MaterialType } from "@/types/material";
import { v4 as uuidv4 } from "uuid";

const MATERIALS_KEY = "eco_market_materials";

const getMaterialsFromStorage = (): MaterialType[] => {
  const materials = localStorage.getItem(MATERIALS_KEY);

  if (materials) {
    return JSON.parse(materials);
  }

  const initialMaterials: MaterialType[] = [
    {
      id: 2,
      name: "string",
      category: 1,
      description: "string",
      price: 0,
      quantity: 0,
      unit: "kg",
      location: "string",
      seller_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      image_url: null,
      deal_type: "buy", // Теперь соответствует типу "buy" | "sell" | undefined
      status: "active",
    },
  ];

  localStorage.setItem(MATERIALS_KEY, JSON.stringify(initialMaterials));
  return initialMaterials;
};

const saveMaterials = (materials: MaterialType[]) => {
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
};

export const getMaterials = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/materials`
  );

  if (!response.ok) {
    throw new Error("Не удалось загрузить материалы");
  }

  return await response.json();
};

export const getMaterialById = async (id: number) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/materials/${id}`
    );

    if (!response.ok) {
      throw new Error("Material not found");
    }

    const material = await response.json();
    console.log(`Fetching material with ID: ${id}`, material);

    return material;
  } catch (error) {
    console.error(`Error fetching material with ID ${id}:`, error);
    throw error; // Перебрасываем ошибку для обработки в компоненте
  }
};

export const createMaterial = async (
  material: Omit<MaterialType, "status">
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const materials = getMaterialsFromStorage();

  const newMaterial: MaterialType = {
    ...material,
    status: "pending",
  };

  saveMaterials([...materials, newMaterial]);

  return newMaterial;
};

export const updateMaterial = async (
  id: number,
  updates: Partial<MaterialType>
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const materials = getMaterialsFromStorage();
  const index = materials.findIndex((m) => m.seller_id === id);

  if (index === -1) {
    throw new Error("Material not found");
  }

  const updatedMaterial = { ...materials[index], ...updates };
  materials[index] = updatedMaterial;

  saveMaterials(materials);

  return updatedMaterial;
};

export const deleteMaterial = async (id: number) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const materials = getMaterialsFromStorage();
  const filteredMaterials = materials.filter((m) => m.id !== id);

  saveMaterials(filteredMaterials);

  return { success: true };
};

export const getUserMaterials = async (userId: number) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const materials = getMaterialsFromStorage();
  return materials.filter((m) => m.seller_id === userId);
};

export const getAllMaterials = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return getMaterialsFromStorage();
};

export const updateMaterialStatus = async (id: number, status: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const materials = getMaterialsFromStorage();
  const index = materials.findIndex((m) => m.id === id);

  if (index === -1) {
    throw new Error("Material not found");
  }

  materials[index].status = status;

  saveMaterials(materials);

  return materials[index];
};
