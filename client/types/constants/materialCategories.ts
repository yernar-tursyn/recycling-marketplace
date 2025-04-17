export const MATERIAL_CATEGORIES = {
  1: "Пластик",
  2: "Макулатура",
  3: "Стекло",
  4: "Металл",
  5: "Кожа/резина/ветошь",
  6: "Органика",
  7: "Отходы",
} as const;

export type MaterialCategory = keyof typeof MATERIAL_CATEGORIES;
