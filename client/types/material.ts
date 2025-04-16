export interface MaterialType {
  id: number;
  name: string;
  category: number; // 1-7
  description: string | null;
  price: number; // decimal(10,2)
  quantity: number; // decimal(10,2)
  unit: string; // 'kg' по умолчанию
  location: string;
  seller_id: number;
  created_at: string;
  updated_at: string;
  image_url: string | null;
  // Опциональные поля для фронта:
  deal_type?: "buy" | "sell"; // Если нужно
  status?: string; // Если нужно
}
