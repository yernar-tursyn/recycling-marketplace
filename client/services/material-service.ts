import type { MaterialType } from "@/types/material";
import { v4 as uuidv4 } from "uuid";

const MATERIALS_KEY = "eco_market_materials";

const getMaterialsFromStorage = (): MaterialType[] => {
  const materials = localStorage.getItem(MATERIALS_KEY);

  if (materials) {
    return JSON.parse(materials);
  }

  const initialMaterials = [
    {
      id: uuidv4(),
      name: "ПЭТ бутылки",
      type: "plastic",
      description: "Чистые пластиковые бутылки без крышек и этикеток",
      price: 25,
      quantity: 100,
      image: "/placeholder.svg?height=200&width=300",
      userId: "user1",
      userName: "Иван Петров",
      status: "active",
      createdAt: new Date().toISOString(),
      dealType: "sell",
    },
    {
      id: uuidv4(),
      name: "Макулатура",
      type: "paper",
      description: "Газеты, журналы, книги, картон",
      price: 15,
      quantity: 200,
      image: "/placeholder.svg?height=200&width=300",
      userId: "user2",
      userName: "Анна Иванова",
      status: "active",
      createdAt: new Date().toISOString(),
      dealType: "buy",
    },
    {
      id: uuidv4(),
      name: "Алюминиевые банки",
      type: "metal",
      description: "Чистые алюминиевые банки от напитков",
      price: 80,
      quantity: 50,
      image: "/placeholder.svg?height=200&width=300",
      userId: "user3",
      userName: "Петр Сидоров",
      status: "active",
      createdAt: new Date().toISOString(),
      dealType: "sell",
    },
    {
      id: uuidv4(),
      name: "Стеклянные бутылки",
      type: "glass",
      description: "Стеклянные бутылки любого цвета",
      price: 10,
      quantity: 150,
      image: "/placeholder.svg?height=200&width=300",
      userId: "user1",
      userName: "Иван Петров",
      status: "active",
      createdAt: new Date().toISOString(),
      dealType: "buy",
    },
    {
      id: uuidv4(),
      name: "Старая электроника",
      type: "electronics",
      description: "Компьютеры, телефоны, платы и другая электроника",
      price: 200,
      quantity: 30,
      image: "/placeholder.svg?height=200&width=300",
      userId: "user2",
      userName: "Анна Иванова",
      status: "pending",
      createdAt: new Date().toISOString(),
      dealType: "sell",
    },
    {
      id: uuidv4(),
      name: "Картонные коробки",
      type: "paper",
      description: "Чистые картонные коробки",
      price: 20,
      quantity: 100,
      image: "/placeholder.svg?height=200&width=300",
      userId: "user3",
      userName: "Петр Сидоров",
      status: "active",
      createdAt: new Date().toISOString(),
      dealType: "buy",
    },
  ];

  localStorage.setItem(MATERIALS_KEY, JSON.stringify(initialMaterials));
  return initialMaterials;
};

const saveMaterials = (materials: MaterialType[]) => {
  localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
};

export const getMaterials = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return getMaterialsFromStorage();
};

export const getMaterialById = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const materials = getMaterialsFromStorage();
  const material = materials.find((m) => m.id === id);

  if (!material) {
    throw new Error("Material not found");
  }

  console.log(`Fetching material with ID: ${id}`, material);

  return material;
};

export const createMaterial = async (
  material: Omit<MaterialType, "id" | "createdAt" | "status">
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const materials = getMaterialsFromStorage();

  const newMaterial: MaterialType = {
    ...material,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    status: "pending",
  };

  saveMaterials([...materials, newMaterial]);

  return newMaterial;
};

export const updateMaterial = async (
  id: string,
  updates: Partial<MaterialType>
) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const materials = getMaterialsFromStorage();
  const index = materials.findIndex((m) => m.id === id);

  if (index === -1) {
    throw new Error("Material not found");
  }

  const updatedMaterial = { ...materials[index], ...updates };
  materials[index] = updatedMaterial;

  saveMaterials(materials);

  return updatedMaterial;
};

export const deleteMaterial = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const materials = getMaterialsFromStorage();
  const filteredMaterials = materials.filter((m) => m.id !== id);

  saveMaterials(filteredMaterials);

  return { success: true };
};

export const getUserMaterials = async (userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const materials = getMaterialsFromStorage();
  return materials.filter((m) => m.userId === userId);
};

export const getAllMaterials = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return getMaterialsFromStorage();
};

export const updateMaterialStatus = async (id: string, status: string) => {
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
