export interface ApplicationType {
  id: string;
  title: string;
  description: string;
  materialType: string;
  materialId?: string;
  sellerUserId?: string;
  quantity: number;
  price: number;
  userId: string;
  userName?: string; 
  status: string; 
  createdAt: string;
  updatedAt: string;
}
