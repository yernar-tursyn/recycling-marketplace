export interface UserType {
  id: string;
  name: string;
  email: string;
  password?: string;
  type: string;
  role: string;
  status: string;
  avatar: string;
  location: string;
  createdAt: string;
  bio?: string;
}
